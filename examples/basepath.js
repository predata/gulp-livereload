const gulp = require('gulp');
const less = require('gulp-less');
const livereload = require('gulp-livereload');

gulp.task('less', () => {
  return gulp.src('less/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist/styles'))
    .pipe(livereload());
});

gulp.task('watch', () => {
  livereload.listen({ basePath: 'dist' });
  gulp.watch('less/*.less', ['less']);
});
