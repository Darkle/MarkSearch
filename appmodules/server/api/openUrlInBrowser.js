'use strict';

var shell = require('electron').shell

function openUrlInBrowser(req, res, next){
  //TODO validation
  //can do a simple url test validation cause will know what each external url is
  // so maybe just to a
  var urlToOpen = req.params.urlToOpen
  var urlIsValid = [
    'http://foo.com',
    'http://bar.com'
  ].find(url => url===urlToOpen)

  if(urlIsValid){
    shell.openExternal(urlToOpen)
  }
}

module.exports = openUrlInBrowser