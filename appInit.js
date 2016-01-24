'use strict';

var path = require('path')

var express = require('express')
var electron = require('electron')
var debug = require('debug')('MarkSearch:appInit')
var Server = require('hyperbole')

var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))
var electronInit = require(path.join(__dirname, 'electronInit'))

var expressApp = express()
var electronApp = electron.app
var appDataPath = path.join(electronApp.getPath('appData'), 'MarkSearch')

//TODO port/domain selection
var serverPort = '3000'

electronInit(electron, electronApp)
    .then(() => initializeDBs(appDataPath, expressApp))
    .then(() => {
      var server = new Server(expressApp, serverPort)
      return server.start()
    })
    .then(() => expressInit(expressApp, express, serverPort, electronApp))
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
