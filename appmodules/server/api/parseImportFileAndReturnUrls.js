'use strict';

var parsePath = require('parse-filepath')
var jetpack = require('fs-jetpack')

function parseImportFileAndReturnUrls(req, res, next){
  var importBookmarksFilePath = parsePath(req.params.importBookmarksFilePath).path
  //TODO validation?
  var fileType = req.params.fileType
  jetpack.readAsync(importBookmarksFilePath)
    .then(fileContents => {
      if(!fileContents){
        res.status(500).json({errorMessage: 'File does not exist.'})
      }
      else{
        res
          .status(200)
          .json(
            {
              fileType: fileType,
              fileContents: fileContents
            }
          )
      }
    })
    .catch( err => {
      console.error(err)
      var errorMessage = err
      if(!_.isString(errorMessage)){
        errorMessage = JSON.stringify(err.message)
      }
      res.status(500).json({errorMessage: errorMessage})
    })
}

module.exports = parseImportFileAndReturnUrls