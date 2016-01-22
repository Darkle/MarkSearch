'use strict';

var path = require('path')

var express = require('express')
var app = express()
var debug = require('debug')('MarkSearch:app')
var Server = require('hyperbole')

var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'server', 'expressInit'))

function serverInit(appDataPath){

  var serverPort = '3000'
  app.set('port', serverPort)

  var server = new Server(app, serverPort)

  server.start()
      .then(() => initializeDBs(appDataPath, app))
      .then(() => expressInit(app, express))
      .catch(err =>{
        debug(err)
        console.error(err);
        /****
         * Create a window in electron and show error - perhaps have a button to restart as well
         */
      })
}

module.exports = serverInit



