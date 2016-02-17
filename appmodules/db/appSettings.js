'use strict';

var path = require('path')
var Crypto = require('crypto')

var debug = require('debug')('MarkSearch:appSettings')
var envs = require('envs')

var knexConfig = require('./knexConfig')[envs('NODE_ENV')]

var appSettings = {}

appSettings.init = (appDataPath) => {
  debug(`appDataPath: ${appDataPath}`)
  knexConfig.connection.filename = path.join(appDataPath, 'MarkSearchAppSettings.db')
  //knexConfig.connection.filename = ':memory:'
  appSettings.db = require('knex')(knexConfig)
  /***
   * On first run, save the location where the pages db will be stored.
   * Also generate a random secret to be used with the Jason Web Tokens for the
   * browser extensions & bookmarklets.
   * http://stackoverflow.com/questions/8855687/ - make it url safe just in case
   */
  appSettings.db.schema.hasTable('appSettings').then( exists => {
    console.log(`exists`)
    console.log(exists)
    if (!exists) {
      debug('creating "appSettings" table')
      return appSettings.db.schema.createTable('appSettings', table => {
        table.text('id').primary().unique().notNullable()
        table.text('JWTsecret').notNullable()
        table.text('pagesDBFilePath').notNullable()
        table.boolean('prebrowsing').notNullable()
      })
    }
  })
  .return(
      appSettings.db.raw(`INSERT INTO appSettings (id, JWTsecret, pagesDBFilePath, prebrowsing)  SELECT * from appSettings WHERE NOT EXISTS  (SELECT 1 FROM appSettings WHERE id = 'appSettings') values('appSettings', 'foo', 'bar', false)`)
      //appSettings.db('appSettings')
      //    .whereNotExists(
      //        appSettings.db('appSettings').where({id: 'appSettings'}).select(1)
      //    )
      //    .insert(
      //        {
      //          id: 'appSettings',
      //          JWTsecret: Crypto.randomBytes(128).toString('hex'),
      //          pagesDBFilePath: path.join(appDataPath, 'MarkSearchPages.db'),
      //          prebrowsing: false
      //        }
      //    )
  )
  .then(() => {
    //console.log(foo)
    //pagesDBFilePath
    //appSettings.JWTsecret
  })
}

//
//appSettings.checkIfSingleKeyExists = (settingKey) => {
//  console.log('settingKey')
//console.log(settingKey)
////console.log(JSON.stringify(appSettings.settings))
//console.dir(appSettings.settings)
//  return new Promise((resolve, reject) => {
//    if(!_.get(appSettings.settings, settingKey)){
//      reject(Error('app settings key not found!'))
//    }
//    else{
//      resolve(settingKey)
//    }
//  })
//}
//
//appSettings.updateSingleSetting = (settingKey, settingValue) => {
//  console.log('settingKey settingValue')
//  console.log(settingKey)
//  console.log(settingValue)
//  appSettings.db.update(
//      {_id: 'appSettingsDoc'},
//      {$set: {[`${settingKey}`]: settingValue}},
//      {
//        multi: false,
//        upsert: false
//      }
//  )
//  //return appSettings.checkIfSingleKeyExists(settingKey)
//  //    .return(
//  //        appSettings.db.updateAsync(
//  //            {_id: 'appSettingsDoc'},
//  //            {$set: {[`${settingKey}`]: settingValue}},
//  //            {
//  //              multi: false,
//  //              upsert: false
//  //            }
//  //        )
//  //    )
//  //    /****
//  //     * _.set returns the updated appSettings object
//  //     */
//  //    .return(_.set(appSettings.settings, settingKey, settingValue))
//}
//
//appSettings.checkIfMultipleKeysExists = (settingKey) => {
//  return new Promise((resolve, reject) => {
//      if(!_.get(appSettings.settings, settingKey)){
//        reject(Error('app settings key not found!'))
//      }
//      else{
//        resolve(settingKey)
//      }
//    })
//}
//
//appSettings.updateMultiSettings = (settingKey, settingValue) => {
//  return appSettings.checkIfMultipleKeysExists(settingKey)
//      .return(
//          appSettings.db.updateAsync(
//          { _id: 'appSettingsDoc' },
//          { $set: { [`${settingKey}`]: settingValue} }
//        )
//      )
//      /****
//       * _.set returns the updated appSettings object
//       */
//      .return(_.set(appSettings.settings, settingKey, settingValue))
//}

module.exports = appSettings