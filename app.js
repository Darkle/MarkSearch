'use strict';

var path = require('path')

var express = require('express')
var app = express()

var initializeDBs = require(path.join(__dirname, 'appmodules', 'db', 'initializeDBs'))
var expressInit = require(path.join(__dirname, 'appmodules', 'expressInit'))

initializeDBs(app)
    .then(() => {
      expressInit(app, express)
    })
    .catch(err => {
      console.error(err);
      /****
       * Create a window in electron and show error - perhaps have a button to restart as well
       */
    })

module.exports = app


