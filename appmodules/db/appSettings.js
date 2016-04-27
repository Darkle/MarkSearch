'use strict'

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
var schemas = require('./appSettingsSanitizationAndValidationSchemas')

var appSettings = {}
var randomCryptoLength = 256

appSettings.init = (appDataPath) => {
  appSettings.db = require('knex')({
    client: 'sqlite3',
    connection: {
      filename: path.join(appDataPath, 'MarkSearchAppSettings.db')
    },
    /****
     * https://github.com/tgriesser/knex/pull/1043
     */
    useNullAsDefault: false
  })
  return appSettings.db.schema.hasTable('appSettings').then( exists => {
    if (!exists){
      global.devMode && console.log('creating "appSettings" table')
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
        table.text('trayIconColor').notNullable()
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
            JWTsecret: Crypto.randomBytes(randomCryptoLength).toString('hex'),
            pagesDBFilePath: path.join(appDataPath, 'MarkSearchPages.db'),
            prebrowsing: true,
            alwaysDisableTooltips: false,
            bookmarkExpiryEnabled: false,
            bookmarkExpiryEmail: '',
            bookmarkExpiryMonths: 3,
            bookmarkExpiryLastCheck: Date.now(),
            skipUpdateVersion: '1',
            serverPort: 8080,
            trayIconColor: 'blue'
          }
        )
        .return(appSettings.db('appSettings').where('id', 'appSettings').first())
    }
    return row
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
                      Error(s): ${ validatedSettingsKeyValObj.format() }`
    global.devMode && console.error(errMessage)
    appLogger.log.error({err: errMessage})
    var errorToReturn = new Error(errMessage)
    /****
     * Note: we need to return a blubird promise here, in case we use bluebird's
     * bind method when calling appSettings.update. Returning a native promise
     * would cause an uncaughtException error as native promise bind is a bit different.
     * Also, throwing an error here would also cause an uncaughtException error
     * because we wouldn't be returning a bluebird promise.
     */
    return Promise.reject(errorToReturn)
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