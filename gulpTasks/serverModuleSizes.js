'use strict'

var path = require('path')
var os = require('os')

var gulp = require('gulp')
var exeq = require('exeq')

var basePath = path.resolve('')
var desktopPath = path.join(os.homedir(), 'Desktop')
var openFileShell = `open -a "Google Chrome"`

gulp.task('serverModuleSizes', () => {
  /****
   * https://github.com/groupon/ndu
   */
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