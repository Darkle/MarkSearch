'use strict'

var isBinaryFile = require("isbinaryfile")
var parsePath = require('parse-filepath')

var appLogger = require('../../utils/appLogger')

function checkIfFileIsBinary(req, res) {

  var filePath

  try{
    filePath = parsePath(req.params.filePath).path
  }
  catch(err){
    global.devMode && console.error(err)
    appLogger.log.error({err, req, res})
    res.status(500).json({errorMessage: 'There was an error parsing the file path'})
    return
  }

  isBinaryFile(filePath, function(err, result) {
    if(err || result){
      var errorMessage = 'File Is Binary'
      if(err){
        errorMessage = err.message
      }
      global.devMode && console.error(err)
      appLogger.log.error({err, req, res})
      res.status(500).json({errorMessage})
    }
    else{
      res.status(200).end()
    }
  })
}

module.exports = checkIfFileIsBinary