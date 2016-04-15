'use strict'

var pagesdb = require('../../db/pagesdb')
var appLogger = require('../../utils/appLogger')

function getAllPages(req, res) {

  var dateFilter = {
    dateFilterStartDate: req.body.dateFilterStartDate,
    dateFilterEndDate: req.body.dateFilterEndDate
  }
  var usingDateFilter = !!(dateFilter.dateFilterStartDate && dateFilter.dateFilterEndDate)
  /****
   * Omiting the pageText as that will be fairly large and we don't need that
   * for getAllPages request.
   * Also don't need checkedForExpiry or pageDomain.
   */
  var pagesdbSelect = pagesdb
                        .db
                        .select(
                          'pageUrl',
                          'pageTitle',
                          'pageDescription',
                          'dateCreated',
                          'archiveLink',
                          'safeBrowsing'
                        )
                        .from('pages')

  if(usingDateFilter){
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
      appLogger.log.error({err, req, res})
      res.status(500).end()
    })

}

module.exports = getAllPages
