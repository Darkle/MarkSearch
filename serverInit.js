'use strict';

var path = require('path')

var express = require('express')
var expressApp = express()
var debug = require('debug')('MarkSearch:serverInit')
var Server = require('hyperbole')

var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))

function serverInit(electronApp){
  var serverPort = '3000'
  expressApp.set('port', serverPort)
  expressApp.set('electronApp', electronApp)

  var server = new Server(expressApp, serverPort)

  server.start()
      .then(() => initializeDBs(electronApp.getPath('appData'), expressApp))
      .then(() => expressInit(expressApp, express))
      .catch(err =>{
        debug(err)
        console.error(err);
        /****
         * Create a window in electron and show error - perhaps have a button to restart as well
         */
      })
}

module.exports = serverInit



