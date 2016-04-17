'use strict'

var path = require('path')

var gulp = require('gulp')
var exeq = require('exeq')

var platform = process.platform

gulp.task('sqlite', () => {
  // TODO - make this work on Windows & Linux
  var sqliteBinaryFullDir

  if(platform === 'darwin'){
    sqliteBinaryFullDir = '/usr/local/opt/sqlite/'
  }
  // else if(platform === 'darwin'){
  //
  // }
  // else if(platform === 'win32'){
  //
  // }

  var electronVersion = require(path.resolve('', 'package.json')).dependencies['electron-prebuilt'].slice(1)

  return exeq(
    `npm install sqlite3 --runtime=electron --target=${ electronVersion } --build-from-source --sqlite=${ sqliteBinaryFullDir }`
  )
  .then(function() {
    console.log('Successfully compiled sqlite3 lib binding')
  })
  .catch(function(err) {
    console.error('There was an error building sqlite3 lib binding', err)
  })

})
