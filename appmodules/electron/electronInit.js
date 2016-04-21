'use strict'

var electron = require('electron')
var Promise = require('bluebird')

var pagesdb = require('../db/pagesdb')
var appSettings = require('../db/appSettings')

var electronApp = electron.app
var platform = process.platform

function electronInit() {
    return new Promise(resolve => {

      if(electronApp.makeSingleInstance(() => true)){
        console.log('Marksearch Is Already Running')
        electronApp.quit()
      }
      /****
       * Electron seems to quit if 'window-all-closed' has no
       * event handler and you close all the windows (at least it
       * does on OSX)
       */
      electronApp.on('window-all-closed', () => {
        // do nothing
      })

      electronApp.on('will-quit', () => {
        /****
         * Disconnect knex sqlite connections
         */
        if(pagesdb.db){
          pagesdb.db.destroy()
        }
        if(appSettings.db){
          appSettings.db.destroy()
        }
      })

      electronApp.on('ready', () => {
        /****
         * Hide the app in the dock, cause we don't need it, and also
         * so there is no menu in the menu bar when they open the settings
         * page.
         */
        if(platform === 'darwin'){
          electronApp.dock.hide()
        }
        resolve()
      })
    })
}

module.exports = electronInit




