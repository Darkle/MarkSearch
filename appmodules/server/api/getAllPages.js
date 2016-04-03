'use strict';

var pagesdb = require('../../db/pagesdb')
var checkAndCoerceDateFilterParams = require('../../utils/checkAndCoerceDateFilterParams')
var appLogger = require('../../utils/appLogger')

function getAllPages(req, res, next) {

  var dateFilter = checkAndCoerceDateFilterParams(req.body)
  var pagesdbSelect = pagesdb.db('pages')

  if(dateFilter){
    pagesdbSelect = pagesdbSelect
        .where('dateCreated', '>=', dateFilter.dateFilterStartDate)
        .where('dateCreated', '<=', dateFilter.dateFilterEndDate)
  }

  pagesdbSelect
    .orderBy('dateCreated', 'desc')
    .then( rows => {
      res.json(rows)
    })
    .catch( err => {
      console.error(err)
      appLogger.log.error({err})
      res.status(500).end()
    })

}

module.exports = getAllPages
