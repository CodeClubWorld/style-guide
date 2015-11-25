/*
  Specifying the production environment:

    gulp --rails_env=production
*/

'use strict';

//  Load Gulp Dependencies
var gulp        = require('gulp');
var notify      = require('gulp-notify');
var plumber     = require('gulp-plumber');
var require_dir = require('require-dir');
var rev_all     = require('gulp-rev-all');
var sourcemaps  = require('gulp-sourcemaps');
var util        = require('gulp-util');

//  Set website assets configuration
var app_assets = {
  javascripts: {
    source: 'app/assets/javascripts',
    main:   'application.js',
    dest:   'public/assets/javascripts'
  },
  stylesheets: {
    source: 'app/assets/stylesheets',
    main:   'application.scss',
    dest:   'public/assets/stylesheets'
  }
};

//  Set style guide assets configuration
var cc_assets = {
  javascripts: {
    source: 'app/assets/javascripts/code_club',
    main:   'code_club.js',
    dest:   'public/assets/javascripts'
  },
  stylesheets: {
    source: 'app/assets/stylesheets/code_club',
    main:   'code_club.scss',
    dest:   'public/assets/stylesheets'
  }
};

//  Utility functions
function handleError(error) {
  util.log(error.toString());

  notify({
    message: error
  });

  return this.emit('end');
}

function env_is(env) {
  return undefined != util.env.rails_env && (util.env.rails_env == env);
}

function env_is_production() {
  return env_is('production');
}

function progress(main, message) {
  return util.log('- ' + main + ' - ' + message);
}

//  Master JavaScript processing function
function process_javascripts(config) {
  var babel  = require('gulp-babel');
  var uglify = require('gulp-uglify');

  var main   = config.main;
  var dest   = config.dest;

  var stream = gulp.src(config.source + '/' + main)
    .pipe(plumber({
      errorHandler: handleError
    })).on('end', function () {
      progress(main, 'Begin Compilation');
    });

  stream = stream.pipe(sourcemaps.init()).on('end', function () {
    progress(main, 'Init Sourcemap');
  });

  stream = stream.pipe(babel({
    presets: ['es2015']
  })).on('end', function () {
    progress(main, 'Transpiling ES6');
  });

  if (env_is_production()) {
    stream = stream.pipe(uglify()).on('end', function () {
      progress(main, 'Uglifying');
    });
  }

  stream = stream.pipe(sourcemaps.write('.')).on('end', function () {
    progress(main, 'Generating Sourcemap');
  });

  stream = stream.pipe(gulp.dest(dest)).on('end', function () {
    progress(main, 'Writing file to ' + dest);
  }).on('error', handleError);

  return stream;
}

//  Master Stylesheet processing function
function process_stylesheets(config) {
  var autoprefixer = require('gulp-autoprefixer');
  var minify_css   = require('gulp-minify-css');
  var sass         = require('gulp-sass');

  var main = config.main;
  var dest = config.dest;

  var stream = gulp.src(config.source + '/' + main)
    .pipe(plumber({
      errorHandler: handleError
    })).on('end', function () {
      progress(main, 'Begin Compilation');
    });

  stream = stream.pipe(sourcemaps.init()).on('end', function () {
    progress(main, 'Init Sourcemap');
  });

  stream = stream.pipe(sass()).on('end', function () {
    progress(main, 'Compile Sass');
  });

  stream = stream.pipe(autoprefixer()).on('end', function () {
    progress(main, 'Autoprefixing');
  });

  if (env_is_production()) {
    stream = stream.pipe(minify_css()).on('end', function () {
      progress(main, 'Minifying Compiled Styles');
    });
  }

  stream = stream.pipe(sourcemaps.write('.')).on('end', function () {
    progress(main, 'Generating Sourcemap');
  });

  stream = stream.pipe(gulp.dest(dest)).on('end', function () {
    progress(main, 'Writing file to ' + dest);
  }).on('error', handleError);

  return stream;
}

//  Application assets tasks
gulp.task('app_javascripts', function () {
  return process_javascripts(app_assets.javascripts);
});

gulp.task('app_stylesheets', function () {
  return process_stylesheets(app_assets.stylesheets);
});

//  Style guide assets tasks
gulp.task('cc_javascripts', function () {
  return process_javascripts(cc_assets.javascripts);
});

gulp.task('cc_stylesheets', function () {
  return process_stylesheets(cc_assets.stylesheets);
});

//  Generic tasks
gulp.task('watch', function () {
  //  Application assets
  gulp.watch(app_assets.javascripts.source + '/*.js',     ['app_javascripts']);
  gulp.watch(app_assets.stylesheets.source + '/*.scss',   ['app_stylesheets']);

  //  Style guide assets
  gulp.watch(cc_assets.javascripts.source + '/**/*.js',   ['cc_javascripts']);
  gulp.watch(cc_assets.stylesheets.source + '/**/*.scss', ['cc_stylesheets']);
});

gulp.task('default', [
  'app_javascripts',
  'app_stylesheets',
  'cc_javascripts',
  'cc_stylesheets'
]);
