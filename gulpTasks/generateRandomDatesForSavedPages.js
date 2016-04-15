'use strict';

var path = require('path')
var os = require('os')

var gulp = require('gulp')
var _ = require('lodash')
var moment = require('moment')
var coForEach = require('co-foreach')

var platform = process.platform
var appDataPath

/****
 * https://github.com/s-a/user-appdata/blob/master/lib%2Findex.js
 * https://github.com/janbiasi/appdata/blob/master/lib%2FPersistence.js#L45
 * https://github.com/illfang/node-normalized-appdata/blob/master/index.js
 * https://github.com/MrJohz/appdirectory/blob/master/lib%2Fappdirectory.js
 */
// TODO make it work on Linux & Windows
if(platform === 'darwin'){
  appDataPath = path.join(os.homedir(), 'Library', 'Application Support')
}
// else if(platform === 'darwin'){
//
// }
// else if(platform === 'win32'){
//
// }

gulp.task('randomDates', () => {
  var electron = require('electron-prebuilt')
  console.log(electron)
  var app = require('app')
  var pagesDBknex
  var appSettingsKnex = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.join(appDataPath, 'MarkSearch', 'MarkSearchAppSettings.db')
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
    .then(() => pagesDBknex('pages').select('pageUrl'))
    .then(rows =>
      _.map(rows, (row, index) => {
        var subtractKey = 'days'
        var firstRandomRange = 210
        if(index < 5){
          firstRandomRange = 5
          subtractKey = 'years'
        }
        if(index > 4 && index < 15){
          firstRandomRange = 30
        }
        row.newDateCreated = moment()
          .subtract(_.random(1, firstRandomRange), subtractKey)
          .subtract(_.random(1, 24), 'hours')
          .valueOf()
        return row
      })
    )
    .then(rows =>
      coForEach(rows, function* (row, idx){
        yield pagesDBknex('pages')
          .where('pageUrl', row.pageUrl)
          .update({dateCreated: row.newDateCreated})
          .then(() =>
            pagesDBknex('fts')
              .where('pageUrl', row.pageUrl)
              .update({dateCreated: row.newDateCreated})
          )
      })
    )
    .then(() => {
      console.log('Successfully changed dateCreated on rows in pagesdb')
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })
    .catch(err => {
      console.log('Error changing dateCreated on rows in pagesdb')
      console.error(err)
      pagesDBknex.destroy()
      appSettingsKnex.destroy()
    })

})

