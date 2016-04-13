'use strict';

var electron = require('electron')
var got = require('got')
var ms = require('ms')
var _ = require('lodash')

var appLogger = require('../../utils/appLogger')
var showUpdateNotification = require('./showUpdateNotification')
var appSettings = require('../../db/appSettings')

var devMode = process.env.NODE_ENV === 'development'
var checkInterval = ms('7 days')
var updateUrlToCheck= 'https://raw.githubusercontent.com/Darkle/MarkSearch-Updates/master/updateInfo.json'
/****
 * When running electron in dev, it reports its own package.json version,
 * so when in devMode, get the version number from the MarkSearch
 * package.json directly.
 */
var appVersion = devMode ? require('../../../package.json').version : electron.app.getVersion()

function initUpdatesCheck(){
  setTimeout(() => {
    got(updateUrlToCheck)
      .then(response => {
        var updateData = JSON.parse(response.body)
        if(_.get(updateData, 'latestUpdateVersion.length') &&
          appVersion !== updateData.latestUpdateVersion &&
          updateData.latestUpdateVersion !== appSettings.settings.skipUpdateVersion){
            showUpdateNotification(updateData.latestUpdateVersion)
        }
      })
      .catch(err => {
        console.error(err)
        appLogger({err})
      })
  }, checkInterval)
}

module.exports = initUpdatesCheck