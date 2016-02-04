var gulp = require('gulp')
  , babel = require('gulp-babel')
  , col = require('gulp-util').colors
  , through = require('through')
  , fs = require('fs')
  , download = require('gulp-download');

var path = 'src/**/*.es6';

gulp.task('transpile', function () {
  return gulp.src(path)
    .pipe(babel())
    .pipe(gulp.dest('lib'));
});

gulp.task('watch', function () {
  gulp.watch(path, ['transpile']);
});

gulp.task('test', function () {
  return download('http://localhost:8000')
    .pipe(through(function (data) {
      var str = data.contents.toString()
        , loc = fs.readFileSync('./index.html').toString();
        if (str === loc) {
          console.log(col.green('\nServe Successful'));
        } else {
          console.log(col.bgRed('\nServe Unsuccessful'));
        }
    }));
});

gulp.task('scripts', ['transpile']);

gulp.task('default', ['watch']);
