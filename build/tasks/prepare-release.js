var gulp = require('gulp');
var runSequence = require('run-sequence');
var paths = require('../paths');
var conventionalChangelog = require('gulp-conventional-changelog');
var bump = require('gulp-bump');
var args = require('../args');
var through2 = require('through2');
var fs = require('fs');
var jsonFormat = require('gulp-json-format');

var pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'));

gulp.task('bump-version', function() {
  return gulp.src(['./package.json', './bower.json'])
    .pipe(bump({type: args.bump})) //major|minor|patch|prerelease
    .pipe(gulp.dest('./'));
});

// set bower version to the pkg.version
gulp.task('bump-bower', function() {
  return gulp.src(['./bower.json'])
    .pipe(bump({version: pkg.version}))
    .pipe(gulp.dest('./'));
});

// set in package.json the dependencies to pkg.jspm.dependencies and ensure jspm.jspmPackage = true
gulp.task('update-package-json', function() {
  return gulp.src(['./package.json'])
    .pipe(through2.obj(function(file, enc, callback) {
      var json = JSON.parse(file.contents.toString('utf8'));

      json.jspm.jspmPackage = true;
      json.jspm.peerDependencies = pkg.jspm.dependencies;
      json.dependencies = pkg.jspm.dependencies;

      file.contents = new Buffer(JSON.stringify(json));
      this.push(file);

      return callback();
    }))
    .pipe(jsonFormat(2))
    .pipe(gulp.dest('./'));
});

// set in bower.json the dependencies to pkg.jspm.dependencies and ensure jspm.jspmPackage = true
gulp.task('update-bower-json', function() {
  return gulp.src(['./bower.json'])
    .pipe(through2.obj(function(file, enc, callback) {
      var json = JSON.parse(file.contents.toString('utf8'));

      json.dependencies = pkg.jspm.dependencies;

      file.contents = new Buffer(JSON.stringify(json));
      this.push(file);

      return callback();
    }))
    .pipe(jsonFormat(2))
    .pipe(gulp.dest('./'));
});

gulp.task('changelog', function () {
  return gulp.src(paths.doc + '/CHANGELOG.md', {
    buffer: false
  }).pipe(conventionalChangelog({
    preset: 'angular'
  }))
  .pipe(gulp.dest(paths.doc));
});

gulp.task('prepare-release', function(callback) {
  return runSequence(
    'build',
    'lint',
    'bump-version',
    //'doc',
    'changelog',
    callback
  );
});

gulp.task('prepare-package', function(callback) {
  return runSequence(
    'update-package-json',
    'update-bower-json',
    'bump-bower',
    'changelog',
    callback
  );
});
