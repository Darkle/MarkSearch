'use strict';

var path = require('path')
var Crypto = require('crypto')

var Promise = require("bluebird")
var debug = require('debug')('MarkSearch:appSettings.js')
var NedbStore = require('nedb')
Promise.promisifyAll(NedbStore.prototype)
var _ = require('lodash')

var appSettings = {}

appSettings.init = (appDataPath) => {
  debug(`appDataPath: ${appDataPath}`)
  appSettings.db = new NedbStore({filename: path.join(appDataPath, 'appsettings.json')})
  return appSettings.db.loadDatabaseAsync()
      .then(() => appSettings.db.findOneAsync({_id: 'appSettingsDoc'}))
      .then(returnedDoc => {
        if(!returnedDoc){
          /***
           * On first run, save the location where the pages db will be stored.
           * Also generate a random secret to be used with the Jason Web Tokens for the
           * browser extensions & bookmarklets.
           * http://stackoverflow.com/questions/8855687/ - make it url safe just in case
           */
          var doc = {
            _id: 'appSettingsDoc',
            JWTsecret: Crypto.randomBytes(128).toString('hex'),
            pagesDBFilePath: path.join(appDataPath, 'marksearchpages.db'),
            markSearchSettings: {
              prebrowsing: true
            }
          }
          return appSettings.db.insertAsync(doc)
        }
        else{
          return returnedDoc
        }
      })
      .then(returnedDoc => {
        appSettings.settings = returnedDoc
        return appSettings.settings.pagesDBFilePath
      })
}

appSettings.checkIfSingleKeyExists = (settingKey) => {
  console.log('settingKey')
console.log(settingKey)
//console.log(JSON.stringify(appSettings.settings))
console.dir(appSettings.settings)
  return new Promise((resolve, reject) => {
    if(!_.get(appSettings.settings, settingKey)){
      reject(Error('app settings key not found!'))
    }
    else{
      resolve(settingKey)
    }
  })
}

appSettings.updateSingleSetting = (settingKey, settingValue) => {
  console.log('settingKey settingValue')
  console.log(settingKey)
  console.log(settingValue)
  appSettings.db.update(
      {_id: 'appSettingsDoc'},
      {$set: {[`${settingKey}`]: settingValue}},
      {
        multi: false,
        upsert: false
      }
  )
  //return appSettings.checkIfSingleKeyExists(settingKey)
  //    .return(
  //        appSettings.db.updateAsync(
  //            {_id: 'appSettingsDoc'},
  //            {$set: {[`${settingKey}`]: settingValue}},
  //            {
  //              multi: false,
  //              upsert: false
  //            }
  //        )
  //    )
  //    /****
  //     * _.set returns the updated appSettings object
  //     */
  //    .return(_.set(appSettings.settings, settingKey, settingValue))
}

appSettings.checkIfMultipleKeysExists = (settingKey) => {
  return new Promise((resolve, reject) => {
      if(!_.get(appSettings.settings, settingKey)){
        reject(Error('app settings key not found!'))
      }
      else{
        resolve(settingKey)
      }
    })
}

appSettings.updateMultiSettings = (settingKey, settingValue) => {
  return appSettings.checkIfMultipleKeysExists(settingKey)
      .return(
          appSettings.db.updateAsync(
          { _id: 'appSettingsDoc' },
          { $set: { [`${settingKey}`]: settingValue} }
        )
      )
      /****
       * _.set returns the updated appSettings object
       */
      .return(_.set(appSettings.settings, settingKey, settingValue))
}

module.exports = appSettings