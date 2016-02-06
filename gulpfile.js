var gulp = require('gulp')
  , babel = require('gulp-babel')
  , gutil = require('gulp-util')
  , col = gutil.colors
  , through = require('through')
  , plumber = require('gulp-plumber')
  , fs = require('fs')
  , download = require('gulp-download');

var path = 'src/**/*.es6';

gulp.task('transpile', function () {
  var stream = gulp.src(path)
                .pipe(babel())
                .pipe(plumber(function(err) {
                  gutil.log(err.message);
                  this.emit('end');
                }))
                .pipe(gulp.dest('lib'));
  return stream;
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
