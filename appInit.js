'use strict';

var path = require('path')

var electron = require('electron')
var jadeify = require('electron-jade')
var envs = require('envs')

var app = electron.app
var BrowserWindow = electron.BrowserWindow
var jadeLocals = {
  appPath: app.getAppPath(),
  NODE_ENV: JSON.stringify(envs('NODE_ENV'))
}
jadeify({pretty: true}, jadeLocals)
//var mb = require('menubar')

var initServer = require('./serverInit')

//var menubar = mb(
//    {
//      index: `file:///${path.join(__dirname, 'appmodules', 'menubar', 'menubar.html')}`
//    }
//)
//
//menubar.on('ready', function ready () {
//  console.log('app is ready')
//  // your app code here
//})

var settingsWindow = null
var helpWindow = null
var aboutWindow = null

app.on('window-all-closes', () => {
  if(process.platform !== 'darwin'){
    app.quit()
  }
})

app.on('ready', () => {
  settingsWindow = new BrowserWindow({width: 1024, height: 768})
  settingsWindow.loadURL(`file:///${path.join(__dirname, 'appmodules', 'electron', 'views', 'settings.jade')}`)
  //settingsWindow.loadURL(`http://localhost:3020`)
  settingsWindow.openDevTools()

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
  initServer(app.getPath('appData'))
})

