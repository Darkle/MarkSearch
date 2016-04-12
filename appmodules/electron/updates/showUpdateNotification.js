'use strict';

var path = require('path')

var electron = require('electron')
var Positioner = require('electron-positioner')
var _ = require('lodash')

var appSettings = require('../../db/appSettings')

var ipcMain = electron.ipcMain
var BrowserWindow = electron.BrowserWindow
var electronShell = electron.shell
var notificationWindow = null
var devMode = process.env.NODE_ENV === 'development'

function showUpdateNotification(latestUpdateVersion){

  /****
   * http://electron.atom.io/docs/v0.37.5/api/browser-window/#new-browserwindowoptions
   */
  notificationWindow = new BrowserWindow(
    {
      width: 420,
      height: 140,
      // frame: false,
      resizable: false,
      alwaysOnTop: true,
      maximizable: false,
      fullscreenable: false,
      acceptFirstMouse: true,
      titleBarStyle: 'hidden',
      title: 'An Update Is Available For MarkSearch'
    }
  )

  var positioner = new Positioner(notificationWindow)
  positioner.move('bottomRight')

  notificationWindow.loadURL(`file://${path.join(__dirname, 'updateNotification.html')}`)

  notificationWindow.webContents.on('did-finish-load', function() {
    if(devMode){
      notificationWindow.webContents.openDevTools({detach: true})
    }
    notificationWindow.send('latestUpdateVersion', latestUpdateVersion)
  })

  notificationWindow.on('closed', function() {
    notificationWindow = null
  })
 
  ipcMain.on('openUpdatePage', function(event, arg) {
    notificationWindow.close()
    electronShell.openExternal('https://github.com/Darkle/MarkSearch-Updates')
  })
  
  ipcMain.on('skipThisVersion', function(event, versionToSkip) {
    notificationWindow.close()
    if(!_.isString(versionToSkip) || !versionToSkip.length){
      /****
       * Fall back if there was an issue passing it back.
       */
      versionToSkip = latestUpdateVersion
    }
    appSettings.update({skipUpdateVersion: versionToSkip})
  })

}

module.exports = showUpdateNotification