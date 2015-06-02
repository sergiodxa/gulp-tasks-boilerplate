var babelify   = require('babelify');
var bless      = require('gulp-bless');
var browserify = require('browserify');
var buffer     = require('vinyl-buffer');
var cssnext    = require('gulp-cssnext');
var eslint     = require('gulp-eslint');
var gulp       = require('gulp');
var minifyHTML = require('gulp-minify-html');
var rename     = require('gulp-rename');
var source     = require('vinyl-source-stream');
var uglify     = require('gulp-uglify');

// configuración para distintas tareas
// babelify: configuración de babelify indicando que características
// experimentales activar
// browserify: configuración del nombre del archivo generado
var config = {
  babelify: {
    optional: [
      'es7.asyncFunctions',
      'es7.functionBind',
      'es7.objectRestSpread',
      'es7.trailingFunctionCommas',
      'runtime'
    ]
  },
  browserify: {
    fileName: 'app.js'
  },
  cssnext: {
    compress: true
  }
}

// rutas de donde leer archivos en las distintas tareas
// y donde dejar los archivos generados
var paths = {
  src: {
    eslint: './client/src/es6/**/*.js',
    js    : './client/src/es6/app.js',
    css   : './client/src/css/main.css',
    html  : './client/src/html/**/*.html'
  },
  build: {
    js    : './client/build/js/',
    css   : './client/build/css/',
    html  : './client/build/html/'
  }
}

gulp.task('eslint', function () {
  return gulp
    .src(paths.src.eslint)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('build:js', ['eslint'], function () {
  return browserify({
    entries: paths.src.js,
    debug: true,
    transform: [babelify.configure(config.babelify)]
  }).bundle()
    .pipe(source(browserify.fileName))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.js))
});

gulp.task('build:css', function () {
  gulp.src(paths.src.css)
    .pipe(cssnext(config.cssnext))
    .pipe(rename('style.css'))
    .pipe(bless())
    .pipe(gulp.dest(paths.build.css))
});

gulp.task('build:html', function () {
  gulp.src(paths.src.html)
    .pipe(minifyHTML())
    .pipe(gulp.dest(paths.build.html))
});

gulp.task('watch', function () {
  gulp.watch([paths.src.eslint], ['build:js']);
  gulp.watch([paths.src.css], ['build:css'])
  gulp.watch([paths.src.html], ['build:html', 'build:css']);
});

gulp.task('build', ['build:html', 'build:css', 'build:js']);

gulp.task('default', ['build', 'watch']);
