'use strict'

var path = require('path')

var gulp = require('gulp')
var AppDirectory = require('appdirectory')

// TODO make sure this works on Linux & Windows
var userDirectories = new AppDirectory('MarkSearch')
var appDataPath = userDirectories.userData()

gulp.task('resetCheckedForExpiry', () => {
  var pagesDBknex
  var appSettingsKnex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.join(appDataPath, 'MarkSearchAppSettings.db')
    },
    useNullAsDefault: false
  })

  return appSettingsKnex('appSettings')
    .select('pagesDBFilePath')
    .then(rows => rows[0].pagesDBFilePath)
    .then(pagesDBFilePath => {
      pagesDBknex = require('knex')({
        client: 'sqlite3',
        connection: {
          filename: pagesDBFilePath
        },
        useNullAsDefault: false
      })
    })
    .then(() =>
      pagesDBknex('pages')
        .select('pageUrl')
        .update({checkedForExpiry: false})
    )
    .then(() => {
      console.log('Successfully changed checkedForExpiry on rows in pagesdb')
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })
    .catch(err => {
      console.log('Error changing checkedForExpiry on rows in pagesdb')
      console.error(err)
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })

})