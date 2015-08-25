import babelify from 'babelify';
import bless from 'bless';
import browserify from 'browserify';
import buffer from 'vinyl-buffer';
import cssnext from 'gulp-cssnext';
import eslint from 'gulp-eslint';
import minifyHTML from 'gulp-minify-html';
import rename from 'gulp-rename';
import source from 'vinyl-source-stream';
import uglify from 'gulp-uglify';

// configuración para distintas tareas
// babelify: configuración de babelify indicando que características
// experimentales activar
// browserify: configuración del nombre del archivo generado
const config = {
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
    fileName: 'app.js',
    extensions: ['.jsx']
  },
  cssnext: {
    compress: true
  }
}

// rutas de donde leer archivos en las distintas tareas
// y donde dejar los archivos generados
const paths = {
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

gulp.task('eslint', () => {
  return gulp
    .src(paths.src.eslint)
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failOnError());
});

gulp.task('build:js', ['eslint'], () => {
  return browserify({
    entries: paths.src.js,
    debug: true,
    extensions: config.browserify.extensions,
    transform: [babelify.configure(config.babelify)]
  }).bundle()
    .pipe(source(config.browserify.fileName))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest(paths.build.js))
});

gulp.task('build:css', () =>) {
  gulp.src(paths.src.css)
    .pipe(cssnext(config.cssnext))
    .pipe(rename('style.css'))
    .pipe(bless())
    .pipe(gulp.dest(paths.build.css))
});

gulp.task('build:html', () => {
  gulp.src(paths.src.html)
    .pipe(minifyHTML())
    .pipe(gulp.dest(paths.build.html))
});

gulp.task('watch', () => {
  gulp.watch([paths.src.eslint], ['build:js']);
  gulp.watch([paths.src.css], ['build:css'])
  gulp.watch([paths.src.html], ['build:html', 'build:css']);
});

gulp.task('build', ['build:html', 'build:css', 'build:js']);

gulp.task('default', ['build', 'watch']);
