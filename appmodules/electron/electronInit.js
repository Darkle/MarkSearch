'use strict';

var path = require('path')

var debug = require('debug')('MarkSearch:electronInit')
var electron = require('electron')

var trayMenu = require(path.join(__dirname, 'trayMenu'))

var electronApp = electron.app

function electronInit(){
  return new Promise((resolve, reject) => {
    electron.crashReporter.start({
      productName: 'MarkSearch',
      companyName: 'CoopCoding',
      submitURL: 'http://localhost:3020/api/crashreport',
      autoSubmit: true
    })

    if(electronApp.makeSingleInstance(() => true)){
      debug('Marksearch Is Already Running')
      electronApp.quit()
    }

    electronApp.on('ready', () => {
      trayMenu()
      resolve()
    })

    /****
     * Electron seems to quit if 'window-all-closed' has no
     * event handler and you close all the windows (at least it
     * does on OSX)
     */
    electronApp.on('window-all-closed', () => {})
  })
}

module.exports = electronInit



