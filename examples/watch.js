const gulp = require('gulp');
const less = require('gulp-less');
const livereload = require('gulp-livereload');

gulp.task('less', () => {
  return gulp.src('less/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist'))
    .pipe(livereload());
});

gulp.task('watch', () => {
  livereload.listen();
  gulp.watch('less/*.less', ['less']);
});
