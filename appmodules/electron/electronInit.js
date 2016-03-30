'use strict';

var electron = require('electron')
var Promise = require('bluebird')

var pagesdb = require('../db/pagesdb')
var appSettings = require('../db/appSettings')

var electronApp = electron.app

function electronInit(){
    return new Promise((resolve, reject) => {

      if(electronApp.makeSingleInstance(() => true)){
        console.log('Marksearch Is Already Running')
        electronApp.quit()
      }
      /****
       * Electron seems to quit if 'window-all-closed' has no
       * event handler and you close all the windows (at least it
       * does on OSX)
       */
      electronApp.on('window-all-closed', () => {})

      electronApp.on('will-quit', () => {
        /****
         * Disconnect knex sqlite connection
         */
        if(pagesdb.db){
          pagesdb.db.destroy()
        }
        if(appSettings.db){
          appSettings.db.destroy()
        }
      })

      electronApp.on('ready', () => {
        resolve()
      })
    })
}

module.exports = electronInit




