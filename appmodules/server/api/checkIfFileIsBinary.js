'use strict';

var isBinaryFile = require("isbinaryfile")
var parsePath = require('parse-filepath')

function checkIfFileIsBinary(req, res, next){

  var filePath = parsePath(req.params.filePath).path

  isBinaryFile(filePath, function(err, result) {
    if(err || result){
      var errorMessage = 'File Is Binary'
      if(err){
        errorMessage = err.message
      }
      res.status(500).json({errorMessage})
    }
    else{
      res.status(200).end()
    }
  })
}

module.exports = checkIfFileIsBinary