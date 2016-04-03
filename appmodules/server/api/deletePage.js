'use strict';

var pagesdb = require('../../db/pagesdb')
var appLogger = require('../../utils/appLogger')

function deletePage(req, res, next) {
  //TODO - validation on req.params.pageUrl

      pagesdb
        .deleteRow(req.params.pageUrl)
        .then( numRowsAffected => {
          res.status(200).end()
        })
        .catch( err => {
          console.error(err)
          appLogger.log.error({err})
          res.status(500).end()
        })
}

module.exports = deletePage