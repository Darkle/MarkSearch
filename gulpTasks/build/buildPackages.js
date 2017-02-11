'use strict'

var path = require('path')

var gulp = require('gulp')
var packager = require('electron-packager')
var Zip = require('node-7z')

var archive = new Zip()
var basePath = path.resolve(__dirname, '..', '..')

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
        console.error('there was an error packaging for win64', err)
      }
      else{
        console.log('successfully packaged for win64')
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
        console.error('there was an error packaging for linux64', err)
      }
      else{
        console.log('successfully packaged for linux64, now compressing using 7zip')
        archive.add(
          path.join(commonPackageProperties.out, 'MarkSearch-linux-x64.7z'),
          path.join(commonPackageProperties.out, 'MarkSearch-linux-x64')
        )
        .then(() => {
          console.log('successfully compressed linux package')
        })
        .catch(error => {
          console.error('there was an error compressing the linux package: ', error)
        })
      }
    }
  )
)
