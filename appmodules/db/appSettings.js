'use strict';

var path = require('path')
var Crypto = require('crypto')

var inspector = require('schema-inspector')
var _ = require('lodash')
/****
 * Note: use blubird promises because if we were to return a Promise.reject() and 
 * the caller of appSettings.update uses .bind(), that would cause an
 * uncaughtException as native promise bind is a bit different.
 */
var Promise = require('bluebird')

var appLogger = require('../utils/appLogger')
var knexConfig = require('./knexConfig')[process.env.NODE_ENV]
var schemas = require('./appSettingsSanitizationAndValidationSchemas')

var appSettings = {}

appSettings.init = (appDataPath) => {
  knexConfig.connection.filename = path.join(appDataPath, 'MarkSearchAppSettings.db')
  //knexConfig.connection.filename = ':memory:'
  appSettings.db = require('knex')(knexConfig)
  return appSettings.db.schema.hasTable('appSettings').then( exists => {
    if (!exists) {
      console.log('creating "appSettings" table')
      return appSettings.db.schema.createTable('appSettings', table => {
        table.text('id').primary().notNullable()
        table.text('JWTsecret').notNullable()
        table.text('pagesDBFilePath').notNullable()
        table.boolean('prebrowsing').notNullable()
        table.boolean('alwaysDisableTooltips').notNullable()
        table.boolean('bookmarkExpiryEnabled').notNullable()
        table.text('bookmarkExpiryEmail').notNullable()
        table.integer('bookmarkExpiryMonths').notNullable()
        table.integer('bookmarkExpiryLastCheck').notNullable()
        table.text('skipUpdateVersion').notNullable()
        table.integer('serverPort').notNullable()
      })
    }
  })
  .return(
    appSettings.db('appSettings').where('id', 'appSettings').first()
  )
  .then(row => {
    if(!row){
      /***
       * If the row isn't there yet, insert it, then get it and return it.
       * .toString('hex') for the Jason Web Token to make it url safe (just in case)
       */
      return appSettings.db('appSettings')
          .insert(
              {
                id: 'appSettings',
                JWTsecret: Crypto.randomBytes(256).toString('hex'),
                pagesDBFilePath: path.join(appDataPath, 'MarkSearchPages.db'),
                prebrowsing: true,
                alwaysDisableTooltips: false,
                bookmarkExpiryEnabled: false,
                bookmarkExpiryEmail: '',
                bookmarkExpiryMonths: 3,
                bookmarkExpiryLastCheck: Date.now(),
                skipUpdateVersion: '1',
                serverPort: 8080
              }
          )
          .return(appSettings.db('appSettings').where('id', 'appSettings').first())
    }
    else{
      return row
    }
  })
  .then(row => {
    if(!row){
      throw new Error('unable to get appSettings from sqlite db')
    }
    /****
     * Gonna cache the settings to make them slightly easier to access
     * (as a js object) and slightly faster (e.g. for settings router.get('/')
     * uses et.al.)
     *
     * We sanitize on the way out too for converting the SQLite boolean values
     * from 1/0 to true/false for easier use.
     */
    inspector.sanitize(schemas.appSettingsSanitization, row)
    appSettings.settings = row
    return row.pagesDBFilePath
  })
}

appSettings.update = (settingsKeyValObj) => {
  var settingsKeyValObjSansJWTsecret = _.omit(settingsKeyValObj, ['JWTsecret', 'id'])

  inspector.sanitize(schemas.appSettingsSanitization, settingsKeyValObjSansJWTsecret)

  var validatedSettingsKeyValObj = inspector.validate(schemas.appSettingsValidation, settingsKeyValObjSansJWTsecret)
  if(!validatedSettingsKeyValObj.valid){
    var errMessage = `Error, passed in app settings did not pass validation.
                      Error(s): ${validatedSettingsKeyValObj.format()}`
    console.error(errMessage)
    appLogger.log.error({err: errMessage})
    /****
     * Note: we need to return a blubird promise here, in case we use bluebird's
     * bind method when calling appSettings.update. Returning a native promise
     * would cause an uncaughtException error as native promise bind is a bit different.
     * Also, throwing an error here would also cause an uncaughtException error
     * because we wouldn't be returning a bluebird promise.
     */
    return Promise.reject(errMessage)
  }
  return appSettings.db('appSettings')
    .where('id', 'appSettings')
    .update(settingsKeyValObjSansJWTsecret)
    .return(appSettings.db('appSettings').where('id', 'appSettings').first())
    .then( row => {
      /****
       * We sanitize on the way out too for converting the SQLite boolean values
       * from 1/0 to true/false for easier use.
       */
      inspector.sanitize(schemas.appSettingsSanitization, row)
      appSettings.settings = row
    })
}


module.exports = appSettings