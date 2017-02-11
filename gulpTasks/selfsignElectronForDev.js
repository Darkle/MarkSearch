'use strict'

var path = require('path')

var gulp = require('gulp')
var exeq = require('exeq')

var basePath = path.resolve(__dirname, '..')

gulp.task('selfsign', () => {
  var electronAppPath = path.join(basePath, 'node_modules', 'electron', 'dist', 'Electron.app')
  var shellTask = `codesign -s - -f ${ electronAppPath }`
  /****
   * I'm not sure why, but signing it with or without --deep on it's own doesn't
   * seem to work, however signing it with --deep first and then signing it a
   * second time without --deep seems to work. ¯\_(ツ)_/¯
   */
  return exeq(
    `${ shellTask } --deep`,
    shellTask
  )
  .then(function() {
    console.log('selfsign completed successfully')
  })
  .catch(function(err) {
    console.error('there was an error self signing the electron app', err)
  })

})
