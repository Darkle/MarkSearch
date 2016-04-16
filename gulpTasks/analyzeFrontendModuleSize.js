'use strict'

var path = require('path')
var os = require('os')

var gulp = require('gulp')
var _ = require('lodash')
var exeq = require('exeq')

var basePath = path.resolve('')
var platform = process.platform
var desktopPath
var openFileShell

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

gulp.task('frontendModuleSize', () => {
  /****
   * https://www.npmjs.com/package/disc
   */
  // TODO make it work on Linux & Windows
  var discAppPath = path.join(basePath, 'node_modules', '.bin', 'discify')
  var bundleFilePaths = path.join(basePath, 'frontend', 'static', 'js')
  var bundleFiles = [
    'aboutPage-bundle.js',
    'helpPage-bundle.js',
    'removeOldBookmarksPage-bundle.js',
    'searchPage-bundle.js',
    'settingsPage-bundle.js'
  ]
  _.each(bundleFiles, value => {
    let outputFilePath = `${ path.join(desktopPath, `disc${ value }ModuleSizes.html`) }`
    // console.log(`${discAppPath} ${path.join(bundleFilePaths, value)} > ${outputFilePath}`)

    exeq(
      `${ discAppPath } ${ path.join(bundleFilePaths, value) } > ${ outputFilePath }`,
      `${ openFileShell } ${ outputFilePath }`
    )
    .then(function() {
      console.log('frontendModuleSize (disc) completed successfully, now opening in browser')
    })
    .catch(function(err) {
      console.error('ther was an error with running frontendModuleSize (disc)', err)
    })
  })
})