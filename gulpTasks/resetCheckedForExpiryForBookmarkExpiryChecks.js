'use strict'

var path = require('path')
var os = require('os')

var gulp = require('gulp')

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

gulp.task('resetCheckedForExpiry', () => {
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