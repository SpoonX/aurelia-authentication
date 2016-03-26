var gulp = require('gulp');
var paths = require('../paths');
var eslint = require('gulp-eslint');
var mdlint = require('gulp-remark');
var squeezeParagraphs = require('remark-squeeze-paragraphs');
var remarkNormalizeHeadings = require('remark-normalize-headings');
var remarkValidateLinks = require('remark-validate-links');
var remarkToc = require('remark-toc');


gulp.task('lint', ['lint-test'], function() {
  return gulp.src(paths.source)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('lint-test', function() {
  return gulp.src(paths.test)
    .pipe(eslint({
      rules: {
        'dot-notation': 1,
        'key-spacing': 1
      }
    }))
    .pipe(eslint.format());
});

gulp.task('lint-md', function() {
  gulp.src(['*.md', paths.doc + '/*.md', '!' + paths.doc + '/CHANGELOG.md'],  {base: './'})
    .pipe(mdlint()
      .use(squeezeParagraphs)
      .use(remarkNormalizeHeadings)
      .use(remarkValidateLinks)
      .use(remarkToc, {tight: true, maxDepth: 2})
    ).pipe(gulp.dest('./'));
});
