'use strict';

var path = require('path')
var Crypto = require('crypto')

var inspector = require('schema-inspector')
var _ = require('lodash')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

/****
 * App Settings Validation Schema
 */
var appSettingsValidation = {
  type: 'object',
  strict: true,
  someKeys: ['pagesDBFilePath', 'prebrowsing', 'alwaysDisableTooltips'],
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
    }
  }
}

function coerceIncomingSettingsData(dataObj){
  return _.mapValues(dataObj, val => {
    if(val === 'false'){
      val = false
    }
    if(val === 'true'){
      val = true
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
                alwaysDisableTooltips: false
              }
          )
    }
  })
  .then( rows => {
    if(!rows[0]){
      return appSettings.db('appSettings').where('id', 'appSettings')
    }
    else{
      return rows
    }
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
    appSettings.settings = rows[0]
    return rows[0].pagesDBFilePath
  })
}

appSettings.update = (settingsKeyValObj) => {
  var coercedSettingsKeyValObj = _.omit(coerceIncomingSettingsData(settingsKeyValObj), ['JWTsecret', 'id'])
  var validatedSettingsKeyValObj = inspector.validate(appSettingsValidation, coercedSettingsKeyValObj)
  if(!validatedSettingsKeyValObj.valid){
    var errMessage = `Error, passed in app settings did not pass validation.
                      Error(s): ${validatedSettingsKeyValObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return appSettings.db('appSettings')
        .where('id', 'appSettings')
        .update(coercedSettingsKeyValObj)
        .return(appSettings.db('appSettings').where('id', 'appSettings'))
        .then( rows => {
          appSettings.settings = _.omit(rows[0], ['JWTsecret'])
        })
  }
}




module.exports = appSettings