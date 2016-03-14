'use strict';

var path = require('path')

var Promise = require("bluebird")
var fsExtra = Promise.promisifyAll(require('fs-extra'))
var parsePath = require('parse-filepath')

var pagesdb = require('../../db/pagesdb')

function changePagesDBlocation(req, res, next){
  console.log(`req.body`)
  console.log(req.body)
  var parsedNewPagesDBFileFolder = parsePath(req.body.newPagesDBFileFolder).path
  var parsedOldPagesDBFilePath = parsePath(req.body.oldPagesDBFilePath).path
  var newPagesDBFilePath = path.join(parsedNewPagesDBFileFolder, 'MarkSearchPages.db')
  var oldPagesDBFilePath = parsedOldPagesDBFilePath
  console.log(`newPagesDBFilePath`)
  console.log(newPagesDBFilePath)
  console.log(`oldPagesDBFilePath`)
  console.log(oldPagesDBFilePath)

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
      res.status(500).json(JSON.stringify(err.message))
    })
}

module.exports = changePagesDBlocation