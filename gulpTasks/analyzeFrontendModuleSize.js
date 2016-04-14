'use strict';

var path = require('path')

var gulp = require('gulp')
var _ = require('lodash')
var shell = require('shelljs')
var username = require('username')

var basePath = path.resolve('')

gulp.task('frontendModuleSize', () => {
  /****
   * https://www.npmjs.com/package/disc
   */
  var discAppPath = path.join(basePath, 'node_modules', '.bin', 'discify')
  var desktopPath = path.join('/Users', username.sync(), 'Desktop')
  var bundleFilePaths = path.join(basePath, 'frontend', 'static', 'js')
  var bundleFiles = [
    'aboutPage-bundle.js',
    'helpPage-bundle.js',
    'removeOldBookmarksPage-bundle.js',
    'searchPage-bundle.js',
    'settingsPage-bundle.js'
  ]
  _.each(bundleFiles, value => {
    let outputFilePath = `${path.join(desktopPath, `disc${value}ModuleSizes.html`)}`
    // console.log(`${discAppPath} ${path.join(bundleFilePaths, value)} > ${outputFilePath}`)
    shell.exec(`${discAppPath} ${path.join(bundleFilePaths, value)} > ${outputFilePath}`, (exitCode, stdout, stderr) => {
      if(exitCode === 0){
        console.log('modulesize exec completed successfully')
        shell.exec(`open -a "Google Chrome" ${outputFilePath}`, (exitCode, stdout, stderr) => {
          if(exitCode === 0){
            console.log('opening html file completed successfully')
          }
          else{
            console.error(`
            An error occured
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
          }
        })
      }
      else{
        console.error(`
            An error occured
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
      }
    })
  })
})