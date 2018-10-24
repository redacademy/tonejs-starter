const gulp = require('gulp'),
  prettyError = require('gulp-prettyerror'),
  sass = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  rename = require('gulp-rename'),
  cssnano = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),
  eslint = require('gulp-eslint'),
  browserSync = require('browser-sync'),
  babel = require('gulp-babel'),
  sourcemaps = require('gulp-sourcemaps');

gulp.task('sass', function(done) {
  gulp
    .src('./css/scss/*.scss', { sourcemaps: true })
    .pipe(prettyError())
    .pipe(sass())
    .pipe(
      autoprefixer({
        browsers: ['last 2 versions']
      })
    )
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./build/css'))
    .pipe(cssnano())
    .pipe(
      rename({
        extname: '.min.css'
      })
    )
    .pipe(gulp.dest('./build/css'));

  done();
});

gulp.task('lint', function() {
  return gulp
    .src(['./js/*.js'])
    .pipe(prettyError())
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
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

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: './'
    }
  });

  gulp
    .watch(['build/css/*.css', 'build/js/*.js', 'index.html'])
    .on('change', browserSync.reload);
});

gulp.task('watch', function() {
  gulp.watch('./js/*.js', gulp.series('scripts'));
  gulp.watch('./css/scss/**/*.scss', gulp.series('sass'));
});

gulp.task('default', gulp.parallel('browser-sync', 'watch'));
