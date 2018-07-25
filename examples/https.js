const gulp = require('gulp');
const less = require('gulp-less');
const livereload = require('gulp-livereload');
const read = require('fs').readFileSync;

gulp.task('less', () => {
  return gulp.src('less/*.less')
    .pipe(less())
    .pipe(gulp.dest('css'))
    .pipe(livereload());
});

gulp.task('watch', () => {
  livereload.listen({
    key: read('dev.key'),
    cert: read('dev.pem')
  });
  gulp.watch('less/*.less', ['less']);
});
