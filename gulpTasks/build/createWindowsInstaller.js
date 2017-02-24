'use strict'

var path = require('path')

var gulp = require('gulp')
var inno = require('gulp-inno')
var LineDriver = require('line-driver')

var basePath = path.resolve(__dirname, '..', '..')
var issFilePath = path.join(basePath, 'InstallationMediaMetadata', 'WindowsInnoInstallerSetupScript.iss')
var marksearchVersion = require(path.join(basePath, 'package.json'))

gulp.task('buildWindowsInstaller', () => {
	console.log('Building windows installer')
  /*First we need to update the MarkSearch version in the .iss installer file*/
  LineDriver.write( {
    in : issFilePath,
    line : function( props, parser ){
      if(parser.line.startsWith('AppVersion=')){
        parser.write(`AppVersion=${parser.line.split('AppVersion=')[0]}${marksearchVersion.version}`)
      }
      else{
        parser.write(parser.line)
      }
    },
    /*write here is called when its done writing to the file, it's different to parser.write() */
    write : function( props, parser ){
      console.log('finished changing version number in .iss file, now packaging into installer...')
      gulp.src(issFilePath).pipe(inno())
    }
  })
})