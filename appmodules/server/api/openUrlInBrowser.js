'use strict';

var shell = require('electron').shell

function openUrlInBrowser(req, res, next){
  shell.openExternal(req.params.urlToOpen)
}

module.exports = openUrlInBrowser