'use strict';

var path = require('path')

var gulp = require('gulp')
var shell = require('shelljs')

var basePath = path.resolve('')

gulp.task('selfsign', () => {
  var electronAppPath = path.join(basePath, 'node_modules', 'electron-prebuilt', 'dist', 'Electron.app')
  var shellTask = `codesign -s - -f ${electronAppPath}`
  /****
   * I'm not sure why, but signing it with or without --deep on it's own doesn't
   * seem to work, however signing it with --deep first and then signing it a
   * second time without --deep seems to work. ¯\_(ツ)_/¯
   */
  return shell.exec(`${shellTask} --deep`, (exitCode, stdout, stderr) => {
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