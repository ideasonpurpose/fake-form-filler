'use strict';

var path = require('path');

var _ = require('lodash');
var gulp = require('gulp');
var gutil = require('gulp-util');
var through = require('through2');
// var sourcemaps = require('gulp-sourcemaps');
var uglify = require('gulp-uglify');
var prettyHrtime = require('pretty-hrtime');
var chalk = gutil.colors;
// var rename = require('gulp-rename');
var browserify = require('browserify');
var watchify = require('watchify');
var buffer = require('vinyl-buffer');
var source = require('vinyl-source-stream');
// var reactify = require('reactify');

// var config = require('../config');


var bundlers = {};  // persistent container for watchify instances

gulp.task('watchify', function() {
  return gulp.src('./src/*.js')
    .pipe(through.obj(function(file, enc, cb) {
      var bundler = watchify(browserify(file.path, watchify.args)) // don't send a stream or the watches will never close
        // .transform(reactify)
        .on('update', function(ids) {
          _.forEach(ids, function(id) {
            gutil.log(
              'Watchify:',
              chalk.magenta(path.relative('source', id)),
              'was modified. Rebundling...');
          });
          bundle(file.relative);
        });
      bundlers[file.relative] = bundler;
      bundle(file.relative);
      cb(null, file);
    }));
});


var bundle = function(key) {
  var startTime = process.hrtime();
  bundlers[key]
    // TODO: Can we bind the file/key reference to an external function here and on.error?
    .bundle(function(err) {
      if (!err) {
        gutil.log(
          'Watchify: Bundled', chalk.magenta(key),
          'in', chalk.magenta(prettyHrtime(process.hrtime(startTime)))
        );
      }
    })
    // TODO: make this handler external, see above
    .on('error', function(err) {
      gutil.log(
        'Browserify:', chalk.red('ERROR'),
        '"' + err.message.replace(/'([^']+)'/g, function() {
          return chalk.magenta(arguments[1]);
        }) + '"',
        'in', chalk.magenta(key)
      );
    })
    .pipe(source(key))
    .pipe(buffer())
    // .pipe(rename({extname: '.min.js'}))
    // .pipe(sourcemaps.init({loadMaps: true}))
    // .pipe(uglify())
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('.'));
};


/**
 * browserify task for one-off bundling of js assets
 */
gulp.task('browserify', function() {
  return gulp.src('./src/*.js')
    .pipe(through.obj(function(file, enc, cb) {
      var startTime = process.hrtime();
      browserify(file.path)
        // .transform(reactify)
        // TODO: make this handler external, see above
        .bundle(function(err, stream) {
          if (!err) {
            gutil.log(
              'Browserify: Bundled', chalk.magenta(file.relative),
              'in', chalk.magenta(prettyHrtime(process.hrtime(startTime)))
            );
          }
          cb(err, stream);
        })
        // TODO: make this handler external, see above
        .on('error', function(err) {
          gutil.log(
            'Browserify:', chalk.red('ERROR'),
            '"' + err.message.replace(/'([^']+)'/g, function() {
              return chalk.magenta(arguments[1]);
            }) + '"',
            'in', chalk.magenta(file.relative)
          );
        })
        .pipe(source(file.relative))
        .pipe(buffer())
        // .pipe(rename({extname: '.min.js'}))
        // .pipe(sourcemaps.init({loadMaps: true}))
        // .pipe(uglify())
        // .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('.'));
    }));
  });
