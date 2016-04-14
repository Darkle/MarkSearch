'use strict';

var path = require('path')

var gulp = require('gulp')
var shell = require('shelljs')
var symlink = require('fs-symlink')
var runSequence = require('run-sequence')

var basePath = path.resolve('')

gulp.task('sqlite', () => {
  // TODO - make this work on Windows & Linux
  //var osxSqliteBinaryDir = path.join(basePath, 'sqliteBinaries', 'osx_x86_64', '3.10.2')
  var osxSqliteBinaryDir = '/usr/local/Cellar/sqlite/3.12.0/'
  return shell.exec(
    `npm install sqlite3 --save --build-from-source --sqlite=${osxSqliteBinaryDir}`,
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