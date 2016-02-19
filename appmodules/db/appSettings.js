'use strict';

var path = require('path')
var Crypto = require('crypto')

var debug = require('debug')('MarkSearch:appSettings')
var inspector = require('schema-inspector')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

/****
 * Validation Schema
 */
var appSettingsValidation = {
  type: 'object',
  strict: true,
  properties: {
    pagesDBFilePath: {
      type: 'string',
      optional: true
    },
    prebrowsing: {
      type: 'boolean',
      optional: true
    }
  }
}
var appSettings = {}

appSettings.init = (appDataPath) => {
  debug(`appDataPath: ${appDataPath}`)
  knexConfig.connection.filename = path.join(appDataPath, 'MarkSearchAppSettings.db')
  //knexConfig.connection.filename = ':memory:'
  appSettings.db = require('knex')(knexConfig)
  return appSettings.db.schema.hasTable('appSettings').then( exists => {
    if (!exists) {
      debug('creating "appSettings" table')
      return appSettings.db.schema.createTable('appSettings', table => {
        table.text('id').primary().notNullable()
        table.text('JWTsecret').notNullable()
        table.text('pagesDBFilePath').notNullable()
        table.boolean('prebrowsing').notNullable()
      })
    }
  })
  .return(
      appSettings.db('appSettings').where('id', 'appSettings')
  )
  .tap( rows => {
    if(!rows[0]){
      /***
       * On first run, save the location where the pages db will be stored.
       * Also generate a random secret to be used with the Jason Web Tokens for the
       * browser extensions & bookmarklets.
       * http://stackoverflow.com/questions/8855687/ - make it url safe just in case
       */
      return appSettings.db('appSettings')
          .insert(
              {
                id: 'appSettings',
                JWTsecret: Crypto.randomBytes(128).toString('hex'),
                pagesDBFilePath: path.join(appDataPath, 'MarkSearchPages.db'),
                prebrowsing: false
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
  var validatedSettingsKeyValObj = inspector.validate(appSettingsValidation, settingsKeyValObj)
  if(!validatedSettingsKeyValObj.valid){
    var errMessage = `Error, passed in app settings did not pass validation.
                      Error(s): ${validatedSettingsKeyValObj.format()}`
    debug(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return appSettings.db('appSettings')
        .where('id', 'appSettings')
        .update(settingsKeyValObj)
        .return(appSettings.db('appSettings').where('id', 'appSettings'))
        .then( rows => {
          appSettings.settings = rows[0]
        })
  }
}




module.exports = appSettings