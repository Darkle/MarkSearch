'use strict';

var path = require('path')

var electron = require('electron')
var jadeify = require('electron-jade')
var envs = require('envs')
var debug = require('debug')('MarkSearch:appInit')

var electronApp = electron.app
var BrowserWindow = electron.BrowserWindow
var jadeLocals = {
  appPath: electronApp.getAppPath(),
  NODE_ENV: JSON.stringify(envs('NODE_ENV'))
}
jadeify({pretty: true}, jadeLocals)

var initServer = require('./serverInit')

if(electronApp.makeSingleInstance(() => true)){
  debug('Marksearch Is Already Running')
  electronApp.quit()
}

var settingsWindow = null
var helpWindow = null
var aboutWindow = null

electronApp.on('window-all-closes', () =>{
  if(process.platform !== 'darwin'){
    electronApp.quit()
  }
})

electronApp.on('ready', () =>{
  settingsWindow = new BrowserWindow({width: 1024, height: 768})
  settingsWindow.loadURL(`file:///${path.join(__dirname, 'appmodules', 'electron', 'views', 'settings.jade')}`)
  //settingsWindow.loadURL(`http://localhost:3020`)
  settingsWindow.openDevTools()

  settingsWindow.on('closed', () =>{
    settingsWindow = null
  })
  initServer(electronApp)
})

