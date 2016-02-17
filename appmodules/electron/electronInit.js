'use strict';

var path = require('path')

var debug = require('debug')('MarkSearch:electronInit')
var electron = require('electron')

var appErrorHandler = require('../appErrorHandler')
var pagesdb = require('../db/pagesdb')

var electronApp = electron.app

function electronInit(){
    return new Promise((resolve, reject) => {
      electron.crashReporter.start({
        productName: 'MarkSearch',
        companyName: 'CoopCoding',
        submitURL: 'http://localhost:3020/api/crashreport',
        autoSubmit: true
      })

      process.on('uncaughtException', appErrorHandler)
      //process.once('loaded', function() {})

      if(electronApp.makeSingleInstance(() => true)){
        debug('Marksearch Is Already Running')
        electronApp.quit()
        /****
         * Don't think I need this, but here it is
         */
        reject()
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
        pagesdb.db.destroy()
      })

      electronApp.on('ready', () => {
        resolve()
      })
    })
}

module.exports = electronInit




