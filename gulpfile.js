var gulp = require('gulp'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    prefix = require('gulp-autoprefixer'),
    minifyCSS = require('gulp-minify-css'),
    gutil = require('gulp-util'),
    livereload = require('gulp-livereload'),
    rename = require('gulp-rename'),
    plumber = require('gulp-plumber');

var browserify = require('browserify'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer');

var server = require('./server');
server.listen(4000);

var onerror = function(err) {
    if (err) gutil.log(gutil.colors.magenta('!! Error'), ':', gutil.colors.cyan(err.plugin), '-', gutil.colors.red(err.message), err);
};

gulp.task('scripts', function() {
    return browserify('./src/app.js').bundle()
        .pipe(source('prod.js'))
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(gulp.dest('./app/assets/dist'))
        .pipe(buffer())
        .pipe(rename('prod.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./app/assets/dist'))
        .pipe(livereload());
});

gulp.task('styles', function() {
    return gulp.src(['./scss/**/*.scss'])
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(sass({
            sourceComments: 'map'
        }))
        .pipe(prefix({
            browsers: ['> 1%', 'last 3 versions', 'ie 8']
        }))
        .pipe(minifyCSS())
        .pipe(gulp.dest('./app/assets/css'))
        .pipe(livereload());
});

gulp.task('html', function() {
    return gulp.src(['./app/**/*.html'])
        .pipe(plumber({
            errorHandler: onerror
        }))
        .pipe(livereload());
});

gulp.task('watch', ['styles', 'scripts', 'html'], function() {
    gulp.watch('scss/**/*.scss', ['styles']);
    gulp.watch('src/**/*.js', ['scripts']);
    gulp.watch('app/**/*.html', ['html']);
});

gulp.task('default', ['watch']);