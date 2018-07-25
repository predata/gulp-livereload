const gulp = require('gulp');
const less = require('gulp-less');
const livereload = require('gulp-livereload');
const http = require('http');
const st = require('st');

gulp.task('less', () => {
  return gulp.src('app/styles/*.less')
    .pipe(less())
    .pipe(gulp.dest('dist/styles'))
    .pipe(livereload());
});

gulp.task('watch', ['server'], () => {
  livereload.listen({ basePath: 'dist' });
  gulp.watch('less/*.less', ['less']);
});

gulp.task('server', (done) => {
  http.createServer(
    st({ path: __dirname + '/dist', index: 'index.html', cache: false })
  ).listen(8080, done);
});
