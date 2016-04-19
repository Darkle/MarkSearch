'use strict'

var path = require('path')

var gulp = require('gulp')
var AppDirectory = require('appdirectory')
var existent = require('existent')

var platform = process.platform
// TODO try to get this working on Linux & Windows
var userDirectories

if(platform === 'darwin'){
  userDirectories = new AppDirectory('MarkSearch')
}
// else if(platform === 'linux'){
//
// }
else if(platform === 'win32'){
  userDirectories = new AppDirectory('MarkSearch')
  /****
   * If MarkSearch folder is not in the AppData Local folder, then
   * use the Roaming folder.
   */
  if(!existent.sync(userDirectories.userData())){
    userDirectories = new AppDirectory({
      appName: "MarkSearch",
      useRoaming: true
    })
  }
}

var appDataPath = userDirectories.userData()

/****
 * This is not working on Windows atm because sqlite3 is installed
 * for electron, and gulp runs node, so knex thinks the sqlite3
 * module is not installed.
 * It seems to work ok on OSX though  ¯\_(ツ)_/¯
 */

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