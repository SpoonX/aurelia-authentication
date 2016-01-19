var gulp         = require('gulp');
var paths        = require('../paths');
var rename       = require('gulp-rename');
var dtsGenerator = require('dts-generator');
var del          = require('del');
var vinylPaths   = require('vinyl-paths');

gulp.task('js-to-ts', function() {
  return gulp.src(paths.root + '**/*.js')
    .pipe(rename(function(path) {
      path.extname = ".ts";

      return path;
    }))
    .pipe(gulp.dest(paths.tmp));
});

gulp.task('tsconfig', function() {
  return gulp.src(__dirname + '/../tsconfig.json').pipe(gulp.dest(paths.tmp));
});

gulp.task('dts', ['js-to-ts', 'tsconfig'], function() {
  dtsGenerator.default({
    name   : 'aurelia-auth',
    project: paths.tmp,
    out    : paths.root + 'aurelia-auth.d.ts'
  });

  return gulp.src([paths.tmp]).pipe(vinylPaths(del));
});
