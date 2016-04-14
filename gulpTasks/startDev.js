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
var username = require('username')
var replace = require('gulp-replace')

var basePath = path.resolve('')

gulp.task('default', function() {
  runSequence(
    //'browserify',
    'nodemon',
    'browser-sync',
    'watch-less',
    'watch-js'
  )
})

gulp.task('nodemon', cb => {
  var env = process.env
  //env.DEBUG = 'MarkSearch:*'
  env.NODE_ENV = 'development'

  return nodemon({
    script: path.join(basePath, 'appInit.js'),
    watch: [
      path.join(basePath, 'appInit.js'),
      path.join(basePath, 'appmodules', '**', '*.*')
    ],
    env: env,
    execMap: {
      js: path.join(basePath, 'node_modules', '.bin', 'electron')
    },
    //verbose: true,
    ignore: [
      path.join(basePath, 'frontend', 'static', '**', '*.*'),
      path.join(basePath, 'frontend', 'src', '**', '*.*'),
      path.join(basePath, 'appmodules', 'server', 'views', '*.jade')
    ]
  }).once('start', cb)
})

gulp.task('browser-sync', () =>
  browserSync.init({
    proxy: "192.168.1.10:8080",
    files: [
      //path.join(basePath, 'appmodules', '**', '*.*')
      path.join(basePath, 'appmodules', 'server', 'views', '*.jade')
    ],
    port: 3020,
    open: false, // Stop the browser from automatically opening
    notify: false,
    online: false,  //online: false makes it load MUCH faster
    ghostMode: false  //dont want to mirror clicks, scrolls, forms on all devices
  })
)

gulp.task('watch-less', () =>
  gulp.watch(path.join(basePath, 'frontend', 'src', 'css', '*.less'), ['less'])
)

gulp.task('watch-js', () =>
  /****
   * Doing it this way because of the map issue in browser-sync task below
   */
  gulp.watch(path.join(basePath, 'frontend', 'src', 'js', '**', '*.*'), () => {
    runSequence('browserify', 'browsersync-reload')
  })
)

gulp.task('browsersync-reload', () => {
  browserSync.reload()
})

gulp.task('less', () =>
  gulp.src(path.join(basePath, 'frontend', 'src', 'css', 'styles.less'))
    .pipe(sourcemaps.init())
    .pipe(less().on('error', function(err) {
      gutil.log(err)
      this.emit('end')
    }))
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(path.join(basePath, 'frontend', 'static', 'stylesheets')))
    .pipe(browserSync.stream())
)

/*****
 * Multiple bundles
 * http://fettblog.eu/gulp-browserify-multiple-bundles/
 */
gulp.task('browserify', () => {
  var uName = username.sync()
  var regexForReplace = new RegExp(uName,'gi')
  var files = [
    path.join(basePath, 'frontend', 'src', 'js', 'searchPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'settingsPage', 'settingsPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'removeOldBookmarksPage', 'removeOldBookmarksPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'bookmarkletPage', 'bookmarkletPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'helpPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'aboutPage.js')
  ]
  // map them to our stream function
  var tasks = files.map(function(entry){
    return browserify({
      entries: [entry],
      debug: true,
      // fullPaths: true  //only enable this for if want to run discify below
    })
      .transform("babelify",
        {
          presets: ["es2015"],
          sourceMaps: true
        }
      )
      .on('error', function(err){
        console.log('error with browserify')
        gutil.log(err.message)
        this.emit('end')
      })
      .bundle()
      .on('error', function(err){
        console.log('error with browserify')
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
      /****
       * uglify seemed to have some issue with es2015 stuff
       */
      // .pipe(uglify())
      /****
       * For some reason browserify is including details from the
       * package.json from the got module which includes path username,
       * so remove that.
       */
      .pipe(replace(regexForReplace, ''))
      .pipe(gulp.dest(path.join(basePath, 'frontend', 'static')))
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