'use strict';

var path = require('path')

var gulp = require('gulp')
var shell = require('shelljs')
var symlink = require('fs-symlink')
var runSequence = require('run-sequence')
var jetpack = require('fs-jetpack')
var semver = require('semver')

var basePath = path.resolve('')

gulp.task('sqlite', () => {
  // TODO - make this work on Windows & Linux
  var sqliteBinaryFullDir

  /****
   * OSX - go through the '/usr/local/Cellar/sqlite/' folder
   * and use semver to get the most up to date version installed
   * (homebrew doesn't usually uninstall the old versions).
   */
  var osxSqliteBinaryBaseDir = '/usr/local/Cellar/sqlite/'
  try{
    var sqliteVersions = jetpack.list('/usr/local/Cellar/sqlite/')
    console.log('OSX sqlite versions available')
    console.log(sqliteVersions)
    var osxVersionToUse = '0.0.0'
    sqliteVersions.forEach(version => {
      if(semver.gt(version, osxVersionToUse)){
        osxVersionToUse = version
      }
    })
    console.log('osxVersionToUse')
    console.log(osxVersionToUse)
    sqliteBinaryFullDir = osxSqliteBinaryBaseDir + osxVersionToUse
  }
  catch(err){
    console.error(`There was an error getting the osxSqliteBinaryFullDir`, err)
  }
  return shell.exec(
    `npm install sqlite3 --save --build-from-source --sqlite=${sqliteBinaryFullDir}`,
    (exitCode, stdout, stderr) => {
      if(exitCode !== 0){
        console.error(`
            An error occured with the build-sqlite3-osx-x86-64 gulp task!
            Exit code: ${exitCode}
            Program output: ${stdout}
            Program stderr: ${stderr}
          `)
      }
      else{
        console.log('Successfully compiled sqlite3')
        /****
         * meh
         */
        return runSequence('sqliteSymlink')
      }
    }
  )
})

gulp.task('sqliteSymlink', () => {
  var nodeBindingDefaultFolder = path.join(basePath, 'node_modules', 'sqlite3', 'lib', 'binding', 'node-v47-darwin-x64')
  var nodeBindingSymlink = path.join(basePath, 'node_modules', 'sqlite3', 'lib', 'binding', 'electron-v0.37-darwin-x64')
  return symlink(nodeBindingDefaultFolder, nodeBindingSymlink, 'dir')
    .then(() => {
      console.log('Successfully created symlink')
    })
    .catch(err => {
      console.error(`error creating symlink`, err)
    })
})