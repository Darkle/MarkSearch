'use strict'

if(!process.env.NODE_ENV){
  process.env.NODE_ENV = 'production'
}

global.devMode = process.env.NODE_ENV === 'development'

var path = require('path')

var electron = require('electron')
var existent = require('existent')
var express = require('express')

var appLogger = require('./appmodules/utils/appLogger')
var expressInit = require('./appmodules/server/expressInit')
var initBookmarkExpiry = require('./appmodules/server/bookmarkExpiry').init
var electronInit = require('./appmodules/electron/electronInit')
var initElectronTrayMenu = require('./appmodules/electron/initTrayMenu')
var appSettings = require('./appmodules/db/appSettings')
var pagesdb = require('./appmodules/db/pagesdb')
var initServer = require('./appmodules/server/initServer')
var initUpdatesCheck = require('./appmodules/electron/updates/checkForUpdates')

var appDataPath = path.join(electron.app.getPath('appData'), 'MarkSearch')
var firstRun = !existent.sync(appDataPath)
var expressApp = express()

appLogger.init(appDataPath)

electronInit()
  .then(() => appSettings.init(appDataPath))
  .then(pagesDBFilePath => pagesdb.init(pagesDBFilePath))
  .then(() => initServer(expressApp))
  .then(() => expressInit(express, expressApp))
  .then(initElectronTrayMenu)
  .then(initBookmarkExpiry)
  .then(initUpdatesCheck)
  .then(() => {
    if(firstRun){
      global.devMode && console.info('first run')
      electron.shell.openExternal(global.msServerAddr.combined)
    }
  })
  .catch(err => {
    global.devMode && console.error(err)
    appLogger.log.error({err})
  })
