'use strict'

var path = require('path')

var gulp = require('gulp')
var exeq = require('exeq')

var platform = process.platform
var electronVersion = require(path.resolve('', 'package.json')).dependencies['electron-prebuilt'].slice(1)

gulp.task('sqlite', () => {
  // TODO - make this work on Windows & Linux
  var sqliteBinaryFullDir

  if(platform === 'darwin'){
    /****
     * Homebrew sqlite installed folder
     * /usr/local/opt/sqlite/ is a symlink to the most up to date version installed in /usr/local/Cellar/sqlite
     */
    sqliteBinaryFullDir = '/usr/local/opt/sqlite/'
  }
  // else if(platform === 'linux'){
  //
  // }
  // else if(platform === 'win32'){
  //
  // }

  return exeq(
    `npm install sqlite3 --runtime=electron --target=${ electronVersion } --target_arch=${ process.arch } --target_platform=${ platform } --build-from-source --sqlite=${ sqliteBinaryFullDir }`
  )
  .then(function() {
    console.log('Successfully compiled sqlite3 lib binding')
  })
  .catch(function(err) {
    console.error('There was an error building sqlite3 lib binding', err)
  })

})
