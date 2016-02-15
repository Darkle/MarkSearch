'use strict';

var gulp = require('gulp')
var runSequence = require('run-sequence')
var path = require('path')
var browserSync = require('browser-sync').create()
var nodemon = require('gulp-nodemon')
var sourcemaps = require('gulp-sourcemaps')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
var babelify = require('babelify')
var gutil = require('gulp-util')
var autoprefixer = require('gulp-autoprefixer')
var less = require('gulp-less')
var rename = require('gulp-rename')
var eventStream = require('event-stream')
var shell = require('gulp-shell')


gulp.task('default', function(callback) {
  runSequence(
      //'browserify',
      'nodemon',
      'browser-sync',
      'watch-less',
      'watch-js',
      callback
  )
})

gulp.task('nodemon', cb => {
  var env = process.env
  env.DEBUG = 'MarkSearch:*'
  env.NODE_ENV = 'development'

  return nodemon({
    script: 'appInit.js',
    watch: [
      'appInit.js',
      path.join('appmodules', '**', '*.*')
    ],
    env: env,
    execMap: {
      js: path.join('node_modules', '.bin', 'electron')
    },
    ignore: [
      path.join(__dirname, 'frontend', 'static', '**', '*.*'),
      path.join(__dirname, 'frontend', 'src', '**', '*.*')
    ]
  }).once('start', cb)
})

gulp.task('browser-sync', () =>
  browserSync.init({
    proxy: "localhost:3000",
    files: [
      path.join('appmodules', '**', '*.*')
    ],
    port: 3020,
    open: false, // Stop the browser from automatically opening
    notify: false,
    online: false,  //online: false makes it load MUCH faster
    ghostMode: false  //dont want to mirror clicks, scrolls, forms on all devices
  })
)

gulp.task('watch-less', () =>
    gulp.watch(path.join(__dirname, 'frontend', 'src', 'css', '*.less'), ['less'])
)

gulp.task('watch-js', () =>
  /****
   * Doing it this way because of the map issue in browser-sync task below
   */
  gulp.watch(path.join(__dirname, 'frontend', 'src', 'js', '*.js'), () => {
    runSequence('browserify', 'browsersync-reload')
  })
)

gulp.task('browsersync-reload', () => {
  browserSync.reload()
})

gulp.task('less', () =>
  gulp.src(path.join(__dirname, 'frontend', 'src', 'css', 'styles.less'))
      .pipe(sourcemaps.init())
      .pipe(less().on('error', function(err) {
        gutil.log(err)
        this.emit('end')
      }))
      .pipe(autoprefixer())
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(path.join(__dirname, 'frontend', 'static', 'stylesheets')))
      .pipe(browserSync.stream())
)

/*****
 * Multiple bundles
 * http://fettblog.eu/gulp-browserify-multiple-bundles/
 */
gulp.task('browserify', () => {
  var files = [
    path.join(__dirname, 'frontend', 'src', 'js', 'searchPage.js'),
    path.join(__dirname, 'frontend', 'src', 'js', 'settingsPage.js'),
    path.join(__dirname, 'frontend', 'src', 'js', 'helpPage.js'),
    path.join(__dirname, 'frontend', 'src', 'js', 'aboutPage.js')
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
        .pipe(gulp.dest(path.join(__dirname, 'frontend', 'static')))
        /****
         * browserSync.stream messes up here - I think it's becuase we're mapping, so we're
         * calling it 4 times instead of once. Could individually get around it by using
         * {match:}, but its easier to just call reload from the 'watch-js' task
         * after the whole 'browserify' task has finished.
         */
        //.pipe(browserSync.stream({match: '**/settingsPage-bundle.js'}))
        //.pipe(browserSync.stream())
  })
  // create a merged stream
  return eventStream.merge.apply(null, tasks)
})

gulp.task('build_sqlite3_osx_x86_64',
    shell.task(
        `npm install sqlite3 --save --build-from-source --sqlite=${path.join(__dirname, 'sqliteBinaries', 'osx_x86_64', '3.10.2')}`,
        {verbose: true}
    )
)