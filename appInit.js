'use strict';

var path = require('path')

var electron = require('electron')
var express = require('express')
var debug = require('debug')('MarkSearch:appInit')
var Server = require('hyperbole')

var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))
var electronInit = require(path.join(__dirname, 'appmodules', 'electron', 'electronInit'))
var initElectronTrayMenu = require(path.join(__dirname, 'appmodules', 'electron',  'initTrayMenu'))

var expressApp = express()

//TODO port/domain selection
var serverPort = '3000'

electronInit()
    .then(() => initializeDBs(expressApp))
    .then(() => {
      var server = new Server(expressApp, serverPort)
      return server.start()
    })
    .then(() => expressInit(expressApp, serverPort))
    .then(() => initElectronTrayMenu())
    //TODO - remove after got working
    .then(() => {
      var settingsWindowDev = new electron.BrowserWindow(
          {
            width: 1400,
            height: 1100,
            title: 'MarkSearch Settings'
          }
      )
      //TODO - get address dynamically
      settingsWindowDev.loadURL(`http://localhost:3020/settingsPage`)
      settingsWindowDev.openDevTools()

      settingsWindowDev.on('closed', () =>{
        settingsWindowDev = null
      })
    })
    .catch(err => {
      debug(err)
      console.error(err)
      var dialog = electron.dialog
      /****
       * If electronInit errors, then showErrorBox may not be available
       */
      try{
        dialog.showErrorBox(
            'There Was An Error Starting MarkSearch',
            `${err.message}
          ${JSON.stringify(err)}`
        )
      }
      catch(e){}
    })
