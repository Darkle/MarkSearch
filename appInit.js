'use strict';

var path = require('path')

var electron = require('electron')
var express = require('express')
var debug = require('debug')('MarkSearch:appInit')
var Server = require('hyperbole')

var appErrorHandler = require(path.join(__dirname, 'appmodules', 'appErrorHandler'))
var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))
var electronInit = require(path.join(__dirname, 'appmodules', 'electron', 'electronInit'))
var initElectronTrayMenu = require(path.join(__dirname, 'appmodules', 'electron',  'initTrayMenu'))

var expressApp = express()
var firstRun = false
//TODO port/domain selection
var serverPort = '3000'

electronInit()
    //.then(() => {
    //  throw new Error('foo')
    //})
    .then(() => initializeDBs(expressApp))
    .then(fr => {
      firstRun = fr
      var server = new Server(expressApp, serverPort)
      return server.start()
    })
    .then(() => expressInit(expressApp, serverPort))
    .then(() => initElectronTrayMenu())
    .then(() => {
      if(firstRun){
        electron.shell.openExternal(`http://localhost:3020/`)
      }
    })
    //TODO - remove after got working
    //.then(() => {
      //var settingsWindowDev = new electron.BrowserWindow(
      //    {
      //      width: 1400,
      //      height: 1100,
      //      title: 'MarkSearch Settings',
      //      webPreferences: {
      //        nodeIntegration: false
      //      }
      //    }
      //)
      ////TODO - get address dynamically
      //settingsWindowDev.loadURL(`http://localhost:3020/settingsPage`)
      //settingsWindowDev.openDevTools()
      //
      //settingsWindowDev.on('closed', () =>{
      //  settingsWindowDev = null
      //})
      //var scrapeWindow = new electron.BrowserWindow(
      //    {
      //      width: 800,
      //      height: 600,
      //      //show: false,
      //    }
      //)
      //scrapeWindow.on('closed', function() {
      //  scrapeWindow = null;
      //})
      //
      //scrapeWindow.loadURL(`file://${path.join(__dirname, 'appmodules', 'server', 'api' ,'scrape', 'electronWebview.html')}`)
      //scrapeWindow.webContents.on('did-finish-load', event => {
      //  console.log('did-finish-load')
      //  scrapeWindow.webContents.executeJavaScript(`console.log('execuing js')`)
      //})
  //     scrapeWindow.openDevTools()
      /****
       * in nightmare, nodeIntegration is false by default
       * and audio is muted by default
       * https://github.com/segmentio/nightmare/blob/master/lib/runner.js#L69
       * https://github.com/segmentio/nightmare/blob/master/lib/runner.js#L88
       */

    //})
    .catch(appErrorHandler)
