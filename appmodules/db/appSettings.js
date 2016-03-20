'use strict';

var path = require('path')
var Crypto = require('crypto')

var inspector = require('schema-inspector')
var _ = require('lodash')

var appLogger = require('../utils/appLogger')
var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

/****
 * App Settings Validation Schema
 */
var appSettingsValidation = {
  type: 'object',
  strict: true,
  someKeys: [
    'pagesDBFilePath',
    'prebrowsing',
    'alwaysDisableTooltips',
    'bookmarkExpiryEnabled',
    'bookmarkExpiryEmail',
    'bookmarkExpiryMonths',
    'bookmarkExpiryLastCheck'
  ],
  properties: {
    pagesDBFilePath: {
      type: 'string',
      optional: true
    },
    prebrowsing: {
      type: 'boolean',
      optional: true
    },
    alwaysDisableTooltips: {
      type: 'boolean',
      optional: true
    },
    bookmarkExpiryEnabled: {
      type: 'boolean',
      optional: true
    },
    bookmarkExpiryEmail: {
      type: 'string',
      optional: true
    },
    bookmarkExpiryMonths: {
      type: 'integer',
      eq: [3, 6],
      error: 'bookmarkExpiryMonths must be a an integer of 3 or 6',
      optional: true
    },
    bookmarkExpiryLastCheck: {
      type: 'integer',
      gt: 0,
      error: 'bookmarkExpiryLastCheck must be a valid integer and larger than 0',
      optional: true
    }
  }
}

/****
 * Coerce the true/false/Integer values might get back from frontend as when they send
 * settings via ajax, they are converted to string, so convert back to their proper type.
 *
 * Also, SQLite stores Boolean values as a 0 for false or 1 for true, so convert them to
 * boolean when getting settings from the db, so they are slightly easier to work with.
 */
function coerceSettingsValuesInAndOut(dataObj){
  return _.mapValues(dataObj, (val, key) => {
    if(val === 'false'){
      val = false
    }
    if(val === 'true'){
      val = true
    }
    if(key === 'prebrowsing' || key === 'alwaysDisableTooltips' || key === 'bookmarkExpiryEnabled'){
      val = Boolean(val)
    }
    if(key === 'bookmarkExpiryMonths'){
      val = _.toInteger(val)
    }
    return val
  })
}

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
      })
    }
  })
  .return(
      appSettings.db('appSettings').where('id', 'appSettings')
  )
  .tap( rows => {
    if(!rows[0]){
      /***
       * .toString('hex') for the Jason Web Token to make it url safe (just in case)
       */
      return appSettings.db('appSettings')
          .insert(
              {
                id: 'appSettings',
                JWTsecret: Crypto.randomBytes(128).toString('hex'),
                pagesDBFilePath: path.join(appDataPath, 'MarkSearchPages.db'),
                prebrowsing: true,
                alwaysDisableTooltips: false,
                bookmarkExpiryEnabled: false,
                bookmarkExpiryEmail: '',
                bookmarkExpiryMonths: 3,
                bookmarkExpiryLastCheck: Date.now()
              }
          )
    }
  })
  .then( rows => {
    if(!rows[0]){
      return appSettings.db('appSettings').where('id', 'appSettings')
    }
    return rows
  })
  .then( rows => {
    if(!rows[0]){
      throw new Error('unable to get appSettings from sqlite db')
    }
    /****
     * Gonna cache the settings to make them slightly easier to access
     * (as a js object) and slightly faster (e.g. for settings router.get('/')
     * uses et.al.)
     */
    appSettings.settings = coerceSettingsValuesInAndOut(rows[0])
    return rows[0].pagesDBFilePath
  })
}

appSettings.update = (settingsKeyValObj) => {
  var coercedSettingsKeyValObj = _.omit(coerceSettingsValuesInAndOut(settingsKeyValObj), ['JWTsecret', 'id'])
  var validatedSettingsKeyValObj = inspector.validate(appSettingsValidation, coercedSettingsKeyValObj)

  if(!validatedSettingsKeyValObj.valid){
    var errMessage = `Error, passed in app settings did not pass validation.
                      Error(s): ${validatedSettingsKeyValObj.format()}`
    console.error(errMessage)
    appLogger.log.error(errMessage)
    return Promise.reject(errMessage)
  }
  return appSettings.db('appSettings')
    .where('id', 'appSettings')
    .update(coercedSettingsKeyValObj)
    .return(appSettings.db('appSettings').where('id', 'appSettings'))
    .then( rows => {
      appSettings.settings = coerceSettingsValuesInAndOut(rows[0])
    })
}




module.exports = appSettings