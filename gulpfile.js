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
var shell = require('shelljs')
var coForEach = require('co-foreach')
var username = require('username')
var _ = require('lodash')
var moment = require('moment')


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
  //env.DEBUG = 'MarkSearch:*'
  env.NODE_ENV = 'development'

  return nodemon({
    script: 'appInit.js',
    watch: [
      'appInit.js',
      path.join(__dirname, 'appmodules', '**', '*.*')
    ],
    env: env,
    execMap: {
      js: path.join('node_modules', '.bin', 'electron')
    },
    //verbose: true,
    ignore: [
      path.join(__dirname, 'frontend', 'static', '**', '*.*'),
      path.join(__dirname, 'frontend', 'src', '**', '*.*'),
      path.join(__dirname, 'appmodules', 'server', 'views', '*.jade')
    ]
  }).once('start', cb)
})

gulp.task('browser-sync', () =>
  browserSync.init({
    proxy: "localhost:8080",
    files: [
      //path.join('appmodules', '**', '*.*')
      path.join(__dirname, 'appmodules', 'server', 'views', '*.jade')
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
  gulp.watch(path.join(__dirname, 'frontend', 'src', 'js', '**', '*.*'), () => {
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
    path.join(__dirname, 'frontend', 'src', 'js', 'settingsPage', 'settingsPage.js'),
    path.join(__dirname, 'frontend', 'src', 'js', 'removeOldBookmarksPage', 'removeOldBookmarksPage.js'),
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

gulp.task('sqlite3', () => {
  //var osxSqliteBinaryDir = path.join(__dirname, 'sqliteBinaries', 'osx_x86_64', '3.10.2')
  var osxSqliteBinaryDir = '/usr/local/Cellar/sqlite/3.11.0/'
  shell.exec(
      `npm install sqlite3 --save --build-from-source --sqlite=${osxSqliteBinaryDir}`,
      (exitCode, stdout, stderr) => {
        if(exitCode !== 0){
          console.error(`
            An error occured with the build-sqlite3-osx-x86-64 gulp task!
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
        }
      }
  )
})

gulp.task('selfsign', () => {
  var electronAppPath = path.join(__dirname, 'node_modules', 'electron-prebuilt', 'dist', 'Electron.app')
  var shellTask = `codesign -s - -f ${electronAppPath}`
  /****
   * I'm not sure why, but signing it with or without --deep on it's own doesn't
   * seem to work, however signing it with --deep first and then signing it a
   * second time without --deep seems to work. ¯\_(ツ)_/¯
   * (note: may still need to confirm the accept incomming connections dialog once).
   */
  shell.exec(`${shellTask} --deep`, (exitCode, stdout, stderr) => {
    if(exitCode === 0){
      shell.exec(shellTask, (exitCode, stdout, stderr) => {
        if(exitCode !== 0){
          console.error(`
            An error occured with the second shell task in the osx-selfsign-electron-for-dev gulp task!
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
        }
      })
    }
    else{
      console.error(`
            An error occured with the first shell task in the osx-selfsign-electron-for-dev gulp task!
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
    }
  })
})

gulp.task('change-random-pagesdb-dateCreated', () => {
  var pagesDBknex
  var appSettingsKnex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.join('/Users', username.sync(), 'Library', 'Application Support', 'MarkSearch', 'MarkSearchAppSettings.db')
    },
    useNullAsDefault: false
  })

  return appSettingsKnex('appSettings')
    .select('pagesDBFilePath')
    .then(rows => rows[0].pagesDBFilePath)
    .then(pagesDBFilePath => {
      pagesDBknex = require('knex')({
        client: 'sqlite3',
        connection: {
          filename: pagesDBFilePath
        },
        useNullAsDefault: false
      })
    })
    .then(() => pagesDBknex('pages').select('pageUrl'))
    .then(rows =>
      _.map(rows, (row, index) => {
        var subtractKey = 'days'
        var firstRandomRange = 210
        if(index < 5){
          firstRandomRange = 5
          subtractKey = 'years'
        }
        if(index > 4 && index < 15){
          firstRandomRange = 30
        }
        row.newDateCreated = moment()
                              .subtract(_.random(1, firstRandomRange), subtractKey)
                              .subtract(_.random(1, 24), 'hours')
                              .valueOf()
        return row
      })
    )
    .then(rows =>
      coForEach(rows, function* (row, idx){
        yield pagesDBknex('pages')
          .where('pageUrl', row.pageUrl)
          .update({dateCreated: row.newDateCreated})
          .then(() =>
            pagesDBknex('fts')
              .where('pageUrl', row.pageUrl)
              .update({dateCreated: row.newDateCreated})
          )
      })
    )
    .then(() => {
      console.log('Successfully changed dateCreated on rows in pagesdb')
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })
    .catch(err => {
      console.log('Error changing dateCreated on rows in pagesdb')
      console.error(err)
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })

})

gulp.task('reset-checkedForExpiry', () => {
  var pagesDBknex
  var appSettingsKnex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.join('/Users', username.sync(), 'Library', 'Application Support', 'MarkSearch', 'MarkSearchAppSettings.db')
    },
    useNullAsDefault: false
  })

  return appSettingsKnex('appSettings')
    .select('pagesDBFilePath')
    .then(rows => rows[0].pagesDBFilePath)
    .then(pagesDBFilePath => {
      pagesDBknex = require('knex')({
        client: 'sqlite3',
        connection: {
          filename: pagesDBFilePath
        },
        useNullAsDefault: false
      })
    })
    .then(() =>
      pagesDBknex('pages')
        .select('pageUrl')
        .update({checkedForExpiry: false})
    )
    .then(() => {
      console.log('Successfully changed checkedForExpiry on rows in pagesdb')
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })
    .catch(err => {
      console.log('Error changing checkedForExpiry on rows in pagesdb')
      console.error(err)
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })

})