'use strict'

var electron = require('electron')
var got = require('got')
var ms = require('ms')
var _ = require('lodash')

var appLogger = require('../../utils/appLogger')
var showUpdateNotification = require('./showUpdateNotification')
var appSettings = require('../../db/appSettings')

var checkInterval = ms('7 days')
var updateUrlToCheck= 'https://raw.githubusercontent.com/Darkle/MarkSearch-Updates/master/updateInfo.json'
/****
 * When running electron in dev, Electron reports its own package.json version,
 * so when in devMode, get the MarkSearch application version number from the MarkSearch
 * package.json directly.
 */
var appVersion = global.devMode ? require('../../../package.json').version : electron.app.getVersion()
/****
 * Send some info in the user agent to make it easy to block/contact if needed.
 * This is the default user agent for Electron: http://bit.ly/1S5sOQ9
 */
var uAgent = `Mozilla/5.0 AppleWebKit (KHTML, like Gecko) Chrome/${ process.versions['chrome'] } Electron/${ process.versions['electron'] } Safari MarkSearch App https://github.com/Darkle/MarkSearch`

function checkForUpdate() {
  got(
    updateUrlToCheck,
    {
      headers: {
        'user-agent': uAgent
      }
    }
  )
  .then(response => {
    var updateData = JSON.parse(response.body)
    if(_.get(updateData, 'latestUpdateVersion.length') &&
        appVersion !== updateData.latestUpdateVersion &&
        updateData.latestUpdateVersion !== appSettings.settings.skipUpdateVersion){
      showUpdateNotification(updateData.latestUpdateVersion)
    }
  })
  .catch(err => {
    global.devMode && console.error(err)
    appLogger({err})
  })
}

function initUpdatesCheck() {
  /****
   * Do a check straight away on startup in case they don't leave
   * MarkSearch running for a week.
   */
  checkForUpdate()
  setTimeout(() => {
    checkForUpdate()
  }, checkInterval)
}

module.exports = initUpdatesCheck
