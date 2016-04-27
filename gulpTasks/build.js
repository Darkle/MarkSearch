'use strict'

var gulp = require('gulp')
var runSequence = require('run-sequence')
var path = require('path')
var browserify = require('browserify')
var source = require('vinyl-source-stream')
var buffer = require('vinyl-buffer')
//noinspection Eslint
var babelify = require('babelify')
var gutil = require('gulp-util')
var autoprefixer = require('gulp-autoprefixer')
var less = require('gulp-less')
var clean = require('gulp-clean')
var rename = require('gulp-rename')
var eventStream = require('event-stream')
var stripDebug = require('gulp-strip-debug')
var username = require('username')
var replace = require('gulp-replace')
var packager = require('electron-packager')

var basePath = path.resolve(__dirname, '..')

gulp.task('build', () =>
  runSequence(
    'removeLessSourceMapFile',
    'removeAllJsBundleFiles',
    'lessNoSourceMaps',
    'browserifyNoSourceMaps'
  )
)

gulp.task('removeLessSourceMapFile', () =>
  gulp.src(path.join(basePath, 'frontend', 'static', 'stylesheets', 'styles.css.map'), {read: false}).pipe(clean())
)

gulp.task('removeAllJsBundleFiles', () =>
  gulp.src(path.join(basePath, 'frontend', 'static', 'js'), {read: false}).pipe(clean())
)

gulp.task('lessNoSourceMaps', () =>
  gulp.src(path.join(basePath, 'frontend', 'src', 'css', 'styles.less'))
    .pipe(less().on('error', function(err) {
      gutil.log(err)
      this.emit('end')
    }))
    .pipe(autoprefixer())
    .pipe(gulp.dest(path.join(basePath, 'frontend', 'static', 'stylesheets')))
)

gulp.task('browserifyNoSourceMaps', () => {
  
  var uName = username.sync()
  var regexForReplace = new RegExp(uName, 'gi')
  
  var files = [
    path.join(basePath, 'frontend', 'src', 'js', 'searchPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'settingsPage', 'settingsPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'removeOldBookmarksPage', 'removeOldBookmarksPage.js'),
    path.join(basePath, 'frontend', 'src', 'js', 'bookmarkletPage', 'bookmarkletPage.js')
  ]
  
  // map them to our stream function
  var tasks = files.map(function(entry) {
    return browserify({
      entries: [entry],
    })
    .transform("babelify",
      {
        presets: ["es2015"]
      }
    )
    .on('error', function(err) {
      console.log('error with browserify')
      gutil.log(err.message)
      this.emit('end')
    })
    .bundle()
    .on('error', function(err) {
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
    /****
     * uglify seems to have some issues with es2015 stuff
     */
    // .pipe(uglify())
    /****
     * For some reason browserify is including details from the
     * package.json from the got module which includes path username,
     * so remove that.
     */
    .pipe(replace(regexForReplace, ''))
    /****
     * remove console.logs/errors
     */
    .pipe(stripDebug())
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

gulp.task('package', () =>
  packager(
    {
      platform: 'all',
      arch: 'all',
      dir: basePath,
      asar: true,
      out: path.join(basePath, 'build'),
      overwrite: true,
      prune: true,
      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms'),
      'app-version': require(path.join(basePath, 'package.json')).version,
      'app-bundle-id': 'com.darkle.MarkSearch',
      'app-category-type': 'public.app-category.utilities'
    },
    function doneCallback(err) {
      if(err){
        console.error('there was an error packaging for osx', err)
      }
      else{
        console.log('successfully packaged for osx')
      }
    }
  )
)

gulp.task('packageWin64', () =>
  packager(
    {
      platform: 'win32',
      arch: 'x64',
      dir: basePath,
      asar: true,
      out: path.join(basePath, 'build'),
      overwrite: true,
      prune: true,
      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
    },
    function doneCallback(err) {
      if(err){
        console.error('there was an error packaging for osx', err)
      }
      else{
        console.log('successfully packaged for osx')
      }
    }
  )
)