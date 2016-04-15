'use strict'

var path = require('path')
var os = require('os')

var gulp = require('gulp')
var exeq = require('exeq')

var basePath = path.resolve('')
var platform = process.platform
var desktopPath
var openFileShell

/****
 * https://github.com/s-a/user-appdata/blob/master/lib%2Findex.js
 * https://github.com/janbiasi/appdata/blob/master/lib%2FPersistence.js#L45
 * https://github.com/illfang/node-normalized-appdata/blob/master/index.js
 * https://github.com/MrJohz/appdirectory/blob/master/lib%2Fappdirectory.js
 */
// TODO make it work on Linux & Windows
if(platform === 'darwin'){
  desktopPath = path.join(os.homedir(), 'Desktop')
  openFileShell = `open -a "Google Chrome"`
}
// else if(platform === 'darwin'){
//
// }
// else if(platform === 'win32'){
//
// }

gulp.task('serverModuleSizes', () => {
  /****
   * https://github.com/groupon/ndu
   */
  // TODO make it work on Linux & Windows
  var nduAppPath = path.join(basePath, 'node_modules', '.bin', 'ndu')
  var nduOutputFilePath = path.join(desktopPath, 'nduAppNpmModuleSizes.html')

  return exeq(
    `${ nduAppPath } > ${ nduOutputFilePath }`,
    `${ openFileShell } ${ nduOutputFilePath }`
  )
  .then(function() {
    console.log('modulesize (ndu) completed successfully, now opening in browser')
  })
  .catch(function(err) {
    console.error('ther was an error with running modulesize (ndu)', err)
  })

})