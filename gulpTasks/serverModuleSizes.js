'use strict';

var path = require('path')

var gulp = require('gulp')
var username = require('username')
var shell = require('shelljs')

var basePath = path.resolve('')

gulp.task('serverModuleSizes', () => {
  /****
   * https://github.com/groupon/ndu
   */
  var nduAppPath = path.join(basePath, 'node_modules', '.bin', 'ndu')
  var nduOutputFilePath = path.join('/Users', username.sync(), 'Desktop', 'nduAppNpmModuleSizes.html')
  return shell.exec(`${nduAppPath} > ${nduOutputFilePath}`, (exitCode, stdout, stderr) => {
    if(exitCode === 0){
      console.log('modulesize exec completed successfully')
      shell.exec(`open -a "Google Chrome" ${nduOutputFilePath}`, (exitCode, stdout, stderr) => {
        if(exitCode === 0){
          console.log('opening html file completed successfully')
        }
        else{
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
            An error occured with the first shell task in modulesize gulp task!
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
    }
  })
})