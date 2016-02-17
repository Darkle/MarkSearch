'use strict';

var path = require('path')

var electron = require('electron')
var express = require('express')
var debug = require('debug')('MarkSearch:appInit')
var Server = require('hyperbole')
var existent = require('existent')

var appErrorHandler = require(path.join(__dirname, 'appmodules', 'appErrorHandler'))
var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
//var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))
var electronInit = require(path.join(__dirname, 'appmodules', 'electron', 'electronInit'))
var initElectronTrayMenu = require(path.join(__dirname, 'appmodules', 'electron',  'initTrayMenu'))

var expressApp = express()
////TODO port/domain selection
var serverPort = '3000'
var firstRun = !existent.sync(path.join(electron.app.getPath('appData'), 'MarkSearch'))

electronInit()
    .then(initializeDBs)
    //.then(() => {
    //  var server = new Server(expressApp, serverPort)
    //  return server.start()
    //})
    //.then(() => expressInit(expressApp, serverPort))
    //.then(initElectronTrayMenu)
    //.then(() => {
    //  if(firstRun){
    //      debug('first run')
    //    electron.shell.openExternal(`http://localhost:3020/`)
    //  }
    //})
    //.catch(appErrorHandler)



