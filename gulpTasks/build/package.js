'use strict'

var path = require('path')

var gulp = require('gulp')
var packager = require('electron-packager')

var basePath = path.resolve(__dirname, '..', '..')

gulp.task('packageosx', () =>
  packager(
    {
      platform: 'x64',
      arch: 'darwin',
      dir: basePath,
      asar: true,
      out: path.join(basePath, 'build'),
      overwrite: true,
      prune: true,
      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.icns'),
      'app-version': require(path.join(basePath, 'package.json')).version,
      'app-bundle-id': 'com.darkle.MarkSearch',
      'app-category-type': 'public.app-category.utilities'
    },
    function doneCallback(err) {
      if(err){
        console.error('there was an error packaging for osx', err)
      }
      else{
        console.log('successfully packaged for osx')
      }
    }
  )
)

gulp.task('packagewin64', () =>
  packager(
    {
      platform: 'win32',
      arch: 'x64',
      dir: basePath,
      asar: true,
      out: path.join(basePath, 'build'),
      overwrite: true,
      prune: true,
      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
    },
    function doneCallback(err) {
      if(err){
        console.error('there was an error packaging for osx', err)
      }
      else{
        console.log('successfully packaged for osx')
      }
    }
  )
)

//gulp.task('packagewin32', () =>
//  packager(
//    {
//      platform: 'win32',
//      arch: 'ia32',
//      dir: basePath,
//      asar: true,
//      out: path.join(basePath, 'build'),
//      overwrite: true,
//      prune: true,
//      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
//    },
//    function doneCallback(err) {
//      if(err){
//        console.error('there was an error packaging for osx', err)
//      }
//      else{
//        console.log('successfully packaged for osx')
//      }
//    }
//  )
//)

gulp.task('packagelinux64', () =>
  packager(
    {
      platform: 'linux',
      arch: 'x64',
      dir: basePath,
      asar: true,
      out: path.join(basePath, 'build'),
      overwrite: true,
      prune: true,
      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
    },
    function doneCallback(err) {
      if(err){
        console.error('there was an error packaging for osx', err)
      }
      else{
        console.log('successfully packaged for osx')
      }
    }
  )
)

//gulp.task('packagelinux32', () =>
//  packager(
//    {
//      platform: 'linux',
//      arch: 'ia32',
//      dir: basePath,
//      asar: true,
//      out: path.join(basePath, 'build'),
//      overwrite: true,
//      prune: true,
//      icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
//    },
//    function doneCallback(err) {
//      if(err){
//        console.error('there was an error packaging for osx', err)
//      }
//      else{
//        console.log('successfully packaged for osx')
//      }
//    }
//  )
//)
