'use strict';

/****
 *  Some examples (browsersync, express & nodemon):
 *  https://gist.github.com/sogko/b53d33d4f3b40d3b4b2e
 *  https://gist.github.com/alkrauss48/a3581391f120ec1c3e03
 *  https://github.com/sogko/gulp-recipes/blob/master/browser-sync-nodemon-expressjs/gulpfile.js
*/

var gulp = require('gulp')
var browserSync = require('browser-sync').create()
var nodemon = require('gulp-nodemon')
var sass = require('gulp-sass')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var babelify = require('babelify')
var gutil = require('gulp-util')
var jsinspect = require('gulp-jsinspect')
var autoprefixer = require('gulp-autoprefixer')
var less = require('gulp-less')
var watchify = require('watchify')
var rename = require('gulp-rename')
var eventStream = require('event-stream')


gulp.task('default', ['browser-sync', 'watch'])

//http://www.browsersync.io/docs/options/
gulp.task('browser-sync', ['b', 'nodemon'], () =>{
  browserSync.init({
    proxy: "localhost:3000",
    files: [
      'frontend/static/**/*.*',
      'appmodules/server/views/*.jade',
      'app.js',
      'routes/*.js',
      'appmodules/**/*.*'
    ],
    port: 3020,
    open: false, // Stop the browser from automatically opening
    notify: false,
    reloadDelay: 3000,
    reloadDebounce: 3000,
    /****
     * online: false makes it load MUCH faster
     * http://www.browsersync.io/docs/options/#option-online
     * note: This is needed for some features, so disable this if anything breaks
     */
    online: false,  //
    ghostMode: false  //dont want to mirror clicks, scrolls, forms on all devices
  })
})

gulp.task('nodemon', cb =>
  nodemon({
    script: 'app.js',
    env: {
      'DEBUG': 'MarkSearch:*'
    },
    ignore: ['frontend/static/**/*.*', 'frontend/src/**/*.*']
  }).once('start', cb)
)

gulp.task('watch', () => {
  gulp.watch('frontend/src/css/*.less', ['less'])
  gulp.watch('frontend/src/js/*.js', ['b'])
})

gulp.task('less', () =>
  gulp.src('frontend/src/css/styles.less')
      .pipe(sourcemaps.init())
      .pipe(less().on('error', function(err) {
        gutil.log(err)
        this.emit('end')
      }))
      .pipe(autoprefixer())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest('frontend/static/stylesheets/'))
      .pipe(browserSync.stream())
)

/*****
 * Multiple bundles
 * http://fettblog.eu/gulp-browserify-multiple-bundles/
 */
gulp.task('b', () =>{
  var files = [
    'frontend/src/js/searchPage.js'
  ]
  // map them to our stream function
  var tasks = files.map(function(entry){
    return browserify({
      entries: [entry],
      debug: true
    })
        .transform("babelify", {
          presets: ["es2015"],
          sourceMaps: true
        })
        .on('error', function(err){
          gutil.log(err.message)
          this.emit('end')
        })
        .bundle()
        .on('error', function(err){
          gutil.log(err.message)
          this.emit('end')
        })
        .pipe(source(entry))
        .pipe(rename({
          dirname: 'js',
          extname: '-bundle.js'
        }))
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('frontend/static/'))
        //.pipe(browserSync.stream())
  })
  // create a merged stream
  return eventStream.merge.apply(null, tasks)
})

//var scripts = [
//    'app.js',
//    '/public/javascript/bundle.js',
//    '/appmodules/**/*.js'
//]

//gulp.task('jsinspect', () =>
//  gulp.src(scripts)
//    .pipe(jsinspect({
//      'threshold':   10,
//      'identifiers': true,
//      'suppress':    0
//    }))
//)