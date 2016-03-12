'use strict';

var isBinaryFile = require("isbinaryfile")

function checkIfFileIsBinary(req, res, next){
  //TODO validation
  var filePath = req.params.filePath
  isBinaryFile(filePath, function(err, result) {
    if(err || result){
      var errorMessage = 'File Is Binary'
      if(err){
        errorMessage = err.message
      }
      res.status(500).json({errorMessage: errorMessage})
    }
    else{
      res.status(200).end()
    }
  })
}

module.exports = checkIfFileIsBinary