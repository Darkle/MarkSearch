'use strict'

var path = require('path')

var gulp = require('gulp')
var packager = require('electron-packager')
// var _ = require('lodash')

var basePath = path.resolve(__dirname, '..', '..')
/*****
* Even thogh electron-packager is supposed to pick up the version automatically from the 'electron'
* version in the package.json, it doesn't seem to be working for me - it sets it as 1.4.13 instead
* of 1.4.12, so gonna set it manually.
*/
// var electronVersion = require(path.resolve(__dirname, '..', '..', 'package.json')).dependencies['electron']
// if(_.isNaN(Number(electronVersion[0]))){
//   electronVersion = electronVersion.slice(1)
// }

var commonPackageProperties = {
  dir: basePath,
  asar: true,
  out: path.join(basePath, 'packagesForPlatforms'),
  overwrite: true,
  prune: true,
  name: 'MarkSearch',
  'app-copyright': 'MIT License'
}

gulp.task('packageosx', () =>
  packager(
    Object.assign(
      {},
      commonPackageProperties,
      {
        platform: 'darwin',
        arch: 'x64',
        icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.icns'),
        'app-version': require(path.join(basePath, 'package.json')).version,
        'app-bundle-id': 'com.darkle.MarkSearch',
        'app-category-type': 'public.app-category.utilities'
      }
    ),
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
    Object.assign(
      {},
      commonPackageProperties,
        {
        platform: 'win32',
        arch: 'x64',
        icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
      }
    ),
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

gulp.task('packagelinux64', () =>
  packager(
    Object.assign(
      {},
      commonPackageProperties,
      {
        platform: 'linux',
        arch: 'x64',
        icon: path.join(basePath, 'appmodules', 'electron', 'icons', 'platform', 'ms.ico')
      }
    ),
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
