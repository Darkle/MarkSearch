'use strict';

var path = require('path')

var electron = require('electron')
var Promise = require("bluebird")
var fsExtra = Promise.promisifyAll(require('fs-extra'))

var appSettings = require('./appSettings')
var pagesdb = require('./pagesdb')

var appDataPath = path.join(electron.app.getPath('appData'), 'MarkSearch')

function initializeDBs(){
  /****
   * ensureDirAsync(appDataDir) will make sure the <appData>/MarkSearch folder is there.
   */
  return fsExtra.ensureDirAsync(appDataPath)
      .return(appSettings.init(appDataPath))
      .then(() => {
         appSettings.updateSingleSetting('markSearchSettings.prebrowsing', 22)
        return appSettings.updateSingleSetting('markSearchSettings.prebrowsing', 42)
      })
      //.tap(pagesdb.init)
}

module.exports = initializeDBs