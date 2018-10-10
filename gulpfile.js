const gulp = require('gulp'),
  prettyError = require('gulp-prettyerror'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  eslint = require('gulp-eslint'),
  browserSync = require('browser-sync'),
  babel = require('gulp-babel');

// Create basic Gulp tasks
gulp.task('sass', function(done) {
  gulp
    .src('./css/sass/*.scss', { sourcemaps: true })
    .pipe(prettyError())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(gulp.dest('./build/css'))
    .pipe(cssnano())
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('./build/css'));

  done();
});

gulp.task('lint', function() {
  return (
    gulp
      .src(['./js/*.js'])
      // Also need to use it here...
      .pipe(prettyError())
      .pipe(eslint())
      .pipe(eslint.format())
      .pipe(eslint.failAfterError())
  );
});

gulp.task(
  'scripts',
  gulp.series('lint', function() {
    return gulp
      .src('./js/*.js')
      .pipe(
        babel({
          presets: ['env']
        })
      )
      .pipe(uglify())
      .pipe(
        rename({
          extname: '.min.js'
        })
      )
      .pipe(gulp.dest('./build/js'));
  })
);

// Set-up BrowserSync and watch
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp
    .watch(['build/css/*.css', 'build/js/*.js'])
    .on('change', browserSync.reload);
});

gulp.task('watch', function() {
  gulp.watch('./js/*.js', gulp.series('scripts'));
  gulp.watch('./css/sass/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.parallel('browser-sync', 'watch'));
