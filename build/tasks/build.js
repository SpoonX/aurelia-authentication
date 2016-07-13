var gulp = require('gulp');
var runSequence = require('run-sequence');
var to5 = require('gulp-babel');
var paths = require('../paths');
var compilerOptions = require('../babel-options');
var compilerTsOptions = require('../typescript-options');
var assign = Object.assign || require('object.assign');
var through2 = require('through2');
var concat = require('gulp-concat');
var insert = require('gulp-insert');
var rename = require('gulp-rename');
var clean = require('gulp-clean');
var dummy = require('gulp-empty');
var tools = require('aurelia-tools');
var ts = require('gulp-typescript');
var gutil = require('gulp-util');
var gulpIgnore = require('gulp-ignore');
var merge = require('merge2');
var jsName = paths.packageName + '.js';
var compileToModules = ['es2015', 'commonjs', 'amd', 'system', 'native-modules'];

function cleanGeneratedCode() {
  return through2.obj(function(file, enc, callback) {
    file.contents = new Buffer(tools.cleanGeneratedCode(file.contents.toString('utf8')));
    this.push(file);
    return callback();
  });
}

gulp.task('build-index', ['build-resources-index'], function() {
  var importsToAdd = paths.importsToAdd.slice();

  var src = gulp.src(paths.mainSource);

  if (paths.sort) {
    src = src.pipe(tools.sortFiles());
  }

  if (paths.ignore) {
    paths.ignore.forEach(function(filename){
      src = src.pipe(gulpIgnore.exclude(filename));
    });
  }

  return src
    .pipe(through2.obj(function(file, enc, callback) {
      if (!file) return callback();
      file.contents = new Buffer(tools.extractImports(file.contents.toString('utf8'), importsToAdd));
      this.push(file);
      return callback();
    }))
    .pipe(paths.concat ? concat(jsName) : dummy())
    .pipe(insert.transform(function(contents) {
      return tools.createImportBlock(importsToAdd) + contents;
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('build-resources-index', ['copy-resources'], function() {
  var src = gulp.src(paths.jsResources);

  if (paths.ignore) {
    paths.ignore.forEach(function(filename){
      src = src.pipe(gulpIgnore.exclude(filename));
    });
  }

  return src.pipe(gulp.dest(paths.output));
});

gulp.task('copy-resources', function() {
  return gulp.src(paths.resources)
    .pipe(gulp.dest(paths.output));
});

function gulpFileFromString(filename, string) {
  var src = require('stream').Readable({ objectMode: true });
  src._read = function() {
    this.push(new gutil.File({ cwd: paths.appRoot, base: paths.output, path: filename, contents: new Buffer(string) }))
    this.push(null)
  }
  return src;
}

function srcForBabel() {
  return merge(
    gulp.src(paths.output + '**/*.js'),
    gulpFileFromString(paths.output + 'index.js', "export * from './" + paths.packageName + "';")
  );
}

function srcForTypeScript() {
  return gulp
    .src(paths.output + paths.packageName + '.js')
    .pipe(rename(function (path) {
      if (path.extname == '.js') {
        path.extname = '.ts';
      }
    }));
}

compileToModules.forEach(function(moduleType){
  gulp.task('build-babel-' + moduleType, function () {
    gulp.src(paths.root + '{**/*.css,**/*.html}')
      .pipe(gulp.dest(paths.output + moduleType));

    return srcForBabel()
      .pipe(to5(assign({}, compilerOptions[moduleType]())))
      .pipe(cleanGeneratedCode())
      .pipe(gulp.dest(paths.output + moduleType));
  });

  if (moduleType === 'native-modules') return; // typescript doesn't support the combination of: es5 + native modules

  gulp.task('build-ts-' + moduleType, function () {
    var tsProject = ts.createProject(
      compilerTsOptions({ module: moduleType, target: moduleType == 'es2015' ? 'es2015' : 'es5' }), ts.reporter.defaultReporter());
    var tsResult = srcForTypeScript().pipe(ts(tsProject));
    return tsResult.js
      .pipe(gulp.dest(paths.output + moduleType));
  });
});

gulp.task('build-dts', function(){
  return gulp.src(paths.root + paths.packageName + '.d.ts')
    .pipe(gulp.dest(paths.output));
});

gulp.task('fixup-dts', function(){
  var importsToAdd = [];
  return gulp.src([paths.output + '**/*.d.ts', '!' + paths.output + 'index.d.ts'])
  .pipe(through2.obj(function(file, enc, callback) {
      file.contents = new Buffer(tools.extractImports(file.contents.toString('utf8'), importsToAdd));
      this.push(file);
      return callback();
    }))
    .pipe(concat(paths.packageName + '.d.ts'))
    .pipe(insert.transform(function(contents) {
      importsToAdd = importsToAdd.filter(function(line) {
        return !paths.importsToIgnoreForDts.some(function(plugin) {
          return line.search(plugin) !== -1;
        });
      });
      return tools.createImportBlock(importsToAdd) + contents;
    }))
    .pipe(gulp.dest(paths.output));
});

gulp.task('clean-dts', function() {
  return gulp.src([
     paths.output + '**/*.d.ts',
     '!' + paths.output + '{index,' + paths.packageName + '}.d.ts'
    ], {read: false})
  .pipe(clean({force: true}));
});

gulp.task('build', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    compileToModules
      .map(function(moduleType) { return 'build-babel-' + moduleType })
      .concat(['build-dts']),
   'fixup-dts',
   'clean-dts',
    callback
  );
});

gulp.task('build-ts', function(callback) {
  return runSequence(
    'clean',
    'build-index',
    'build-babel-native-modules',
    compileToModules
      .filter(function(moduleType) { return moduleType !== 'native-modules' })
      .map(function(moduleType) { return 'build-ts-' + moduleType })
      .concat(paths.useTypeScriptForDTS ? ['build-dts'] : []),
    callback
  );
});
