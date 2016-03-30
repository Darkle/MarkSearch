'use strict';

var path = require('path')

var electron = require('electron')
var existent = require('existent')
var jetpack = require('fs-jetpack')
var express = require('express')

var appLogger = require('./appmodules/utils/appLogger')
var expressInit = require('./appmodules/server/expressInit')
var initBookmarkExpiry = require('./appmodules/server/bookmarkExpiry').init
var electronInit = require('./appmodules/electron/electronInit')
var initElectronTrayMenu = require('./appmodules/electron/initTrayMenu')
var appSettings = require('./appmodules/db/appSettings')
var pagesdb = require('./appmodules/db/pagesdb')
var initServer = require('./appmodules/server/initServer')

var appDataPath = path.join(electron.app.getPath('appData'), 'MarkSearch')
var firstRun = !existent.sync(appDataPath)
var expressApp = express()

/****
 * jetpack.dir() will make sure the <appData>/MarkSearch folder is there,
 * as well as the <appData>/MarkSearch/logs folder.
 */
jetpack.dir(path.join(appDataPath, 'logs'))

appLogger.init(appDataPath)

electronInit()
  .then(() => appSettings.init(appDataPath))
  .then(pagesDBFilePath => pagesdb.init(pagesDBFilePath))
  .then(() => initServer(expressApp))
  .then(() => expressInit(express, expressApp))
  .then(initElectronTrayMenu)
  .then(initBookmarkExpiry)
  .then(() => {
    if(firstRun){
      console.info('first run')
      //TODO make dynamic hostdomainportthingo
      electron.shell.openExternal(`http://localhost:3020/`)
    }
  })
  .catch(err => {
    console.error(err)
    appLogger.log.error(err)
  })



