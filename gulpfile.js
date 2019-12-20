// PACKAGE CONNECTION
const {src, dest, watch, series, parallel}  = require('gulp');
const del                                   = require('del');
const plumber                               = require('gulp-plumber');
const notify                                = require('gulp-notify');
const sass                                  = require('gulp-sass');
const autoprefixer                          = require('gulp-autoprefixer');
const cssbeautify                           = require('gulp-cssbeautify');
const mmq                                   = require('gulp-merge-media-queries');
const pug                                   = require('gulp-pug');
const rename                                = require('gulp-rename');
const imagemin                              = require('gulp-imagemin');
const browserSync                           = require('browser-sync').create();

// TASK FUNCTIONS FOR GULP
function clean() {
 return del('./build');
}

function buildcss() {
    return src('src/scss/*.scss', { sourcemaps: true })
        .pipe(plumber({
            errorHandler: notify.onError( function(err){
                return {
                    title: 'Sass Styles Error',
                    message: err.message
                }
            })
        }))
        .pipe(sass())
        .pipe(mmq({
            log: true,
        }))
        .pipe(autoprefixer({
            overrideBrowserslist: ['last 2 versions'],
            cascade: false,
        }))
        .pipe(cssbeautify({
            indent: '   ',
            openbrace: 'end-of-line',
            autosemicolon: true
        }))
        .pipe(plumber.stop())
        .pipe(dest('build/style', { sourcemaps: '../maps' }))
        .pipe(browserSync.stream())
}

function buildhmtl() {
    return src(['src/pug/pages/**/*.pug', '!src/pug/pages/**/_*.pug'])
        .pipe(plumber({
            errorHandler: notify.onError( function(err){
                return {
                    title: 'Pug Error',
                    message: err.message
                }
            })
        }))
        .pipe(pug({
            pretty: true
        }))
        .pipe(rename({
            dirname: '',
        }))
        .pipe(plumber.stop())
        .pipe(dest('build'))
        .pipe(browserSync.stream())
}

function buildfont() {
    return src('src/font/**/*')
        .pipe(dest('build/font'))
        .pipe(browserSync.stream())
}

function buildjs() {
    return src('src/js/**/*.js')
        .pipe(dest('build/js'))
        .pipe(browserSync.stream())
}

function buildimg() {
    return src('src/img/**/*')
        .pipe(imagemin())
        .pipe(dest('build/img'))
        .pipe(browserSync.stream())
}

function server() {
    browserSync.init({
        server: {
            baseDir: "./build"
        }
    })
}

// WATCHES
watch('src/scss/**/*.scss', buildcss);
watch('src/pug/**/*.pug', buildhmtl);
watch('src/js/**/*.js', buildjs);
watch('src/font/**/*', buildfont);
watch('src/img/**/*', buildimg);

// BUILD PROGECT
exports.default = series(
    clean,
    parallel(
        buildhmtl,
        buildcss,
        buildjs,
        buildimg,
        buildfont
    ),
    server
)
