'use strict';

var shell = require('electron').shell

function openUrlInBrowser(req, res, next){
  var urlToOpen = req.params.pageUrl
  var externalHelpLink = 'http://blog.cloudimage.io/2015/10/19/what-is-prebrowsing-and-how-it-can-drastically-improve-your-page-loading-time/'
  if(urlToOpen === externalHelpLink){
    shell.openExternal(urlToOpen)
  }
  else if(urlToOpen.startsWith('/help#')){
    shell.openExternal(`${global.msServerAddr.combined}${urlToOpen}`)
  }
}

module.exports = openUrlInBrowser