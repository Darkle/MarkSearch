'use strict';

var _ = require('lodash')

var pagesdb = require('../../db/pagesdb')

function getAllPages(req, res, next) {

  if(req.body.dateFilterStartDate && req.body.dateFilterEndDate){

    var dateFilterStartDate = _.toNumber(req.body.dateFilterStartDate)
    var dateFilterEndDate = _.toNumber(req.body.dateFilterEndDate)

    pagesdb.db('pages')
        .where('dateCreated', '>=', dateFilterStartDate)
        .andWhere('dateCreated', '<=', dateFilterEndDate)
        .orderBy('dateCreated', 'desc')
        .then( rows => {
          res.json(rows)
        })
        .catch( err => {
          console.error(err)
          res.status(500).end()
        })
  }
  else{
    pagesdb.db('pages')
        .orderBy('dateCreated', 'desc')
        .then( rows => {
          res.json(rows)
        })
        .catch( err => {
          console.error(err)
          res.status(500).end()
        })
  }

}

module.exports = getAllPages
