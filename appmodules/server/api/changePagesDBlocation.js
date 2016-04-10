'use strict';

var path = require('path')

var Promise = require("bluebird")
var fsExtra = Promise.promisifyAll(require('fs-extra'))
var parsePath = require('parse-filepath')

var pagesdb = require('../../db/pagesdb')
var appLogger = require('../../utils/appLogger')

function changePagesDBlocation(req, res, next){

  var parsedNewPagesDBFileFolder
  var parsedOldPagesDBFilePath

  try{
    parsedNewPagesDBFileFolder = parsePath(req.body.newPagesDBFileFolder).path
    parsedOldPagesDBFilePath = parsePath(req.body.oldPagesDBFilePath).path
  }
  catch(err){
    console.error(err)
    appLogger.log.error({err, req, res})
    res
      .status(500)
      .json(
        {
          errorMessage: 'There was an error parsing the newPagesDBFileFolder/oldPagesDBFilePath path'
        }
      )
    return
  }

  var newPagesDBFilePath = path.join(parsedNewPagesDBFileFolder, 'MarkSearchPages.db')
  var oldPagesDBFilePath = parsedOldPagesDBFilePath

  pagesdb.db.destroy()
    .then(() =>
      fsExtra.moveAsync(
        oldPagesDBFilePath,
        newPagesDBFilePath,
        {
          clobber: true
        }
      )
    )
    .then(() => pagesdb.init(newPagesDBFilePath))
    .then(() => {
      console.log('moving database succeeded')
      res.status(200).json(
        {
          newPagesDBFilePath: newPagesDBFilePath
        }
      )
    })
    .catch(err => {
      console.error(err)
      appLogger.log.error({err, req, res})
      res.status(500).json(JSON.stringify(err.message))
    })
}

module.exports = changePagesDBlocation