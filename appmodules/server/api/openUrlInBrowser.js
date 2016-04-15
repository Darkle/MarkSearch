'use strict'

var shell = require('electron').shell

var appLogger = require('../../utils/appLogger')

function openUrlInBrowser(req, res) {
  try{
    shell.openExternal(req.params.urlToOpen)
    res.status(200).end()
  }
  catch(error){
    let errMessage = `There was an error opening the url in the external web browser`
    let err = new Error(errMessage)
    console.error(errMessage)
    appLogger.log.error({err, req, res})
    res.status(500).json({errMessage})
  }
}

module.exports = openUrlInBrowser