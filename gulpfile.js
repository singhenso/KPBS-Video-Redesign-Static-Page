const gulp = require('gulp');
const less = require('gulp-less');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const cleanCSS = require('gulp-clean-css');
const rename = require('gulp-rename');
const uglify = require('gulp-uglify');
const fileinclude = require('gulp-file-include');
const browserSync = require('browser-sync').create();
const replace = require('gulp-replace');

const paths = {
  styles: {
    src: 'src/less/style.less',
    dest: 'dist/css/'
  },
  script: {
    src: 'src/js/*.js',
    dest: 'dist/js/'
  },
  images: {
    src: 'src/img/**/*',
    dest: 'dist/img/'
  }
};

function compileStyles() {
  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

function compileModules() {
  return gulp.src('src/less/global/modules/*.less')
    .pipe(sourcemaps.init())
    .pipe(less())
    .pipe(autoprefixer())
    .pipe(cleanCSS())
    .pipe(rename({ suffix: '.min' }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist/css/modules'))
    .pipe(browserSync.stream());
}

function copyCSS() {
  return gulp.src('src/css/style.css')
    .pipe(gulp.dest('dist/css'));
}

function includeHTML() {
  return gulp.src(['*.html'])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(replace(/dist\/img/g, './img'))
    .pipe(gulp.dest('dist'))
    .pipe(browserSync.stream());
}

function minifyJS() {
  return gulp.src(paths.script.src)
    .pipe(uglify({ mangle: true }))
    .pipe(rename({ suffix: '.min' }))
    .pipe(gulp.dest(paths.script.dest))
    .pipe(browserSync.stream());
}

function optimizeImages() {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest))
    .pipe(browserSync.stream());
}

function watch() {
  browserSync.init({
    server: {
      baseDir: './dist',
      serveStaticOptions: {
        extensions: ['html']
      }
    }
  });

  gulp.watch('src/less/**/*.less', gulp.series(compileStyles, compileModules));
  gulp.watch('src/css/**/*.css', gulp.series(copyCSS, browserSync.reload));
  gulp.watch('src/js/**/*.js', minifyJS);
  gulp.watch('src/img/**/*', optimizeImages);
  gulp.watch(['*.html', 'src/blocks/**/*.html'], includeHTML);
}

exports.watch = watch;
exports.minifyJS = minifyJS;
exports.optimizeImages = optimizeImages;
exports.includeHTML = includeHTML;

exports.default = gulp.series(gulp.parallel(compileStyles, compileModules, copyCSS, minifyJS, optimizeImages, includeHTML), watch);
