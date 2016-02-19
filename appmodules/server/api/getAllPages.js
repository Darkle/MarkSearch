'use strict';

var pagesdb = require('../../db/pagesdb')

function getAllPages(req, res, next) {
  pagesdb.db('pages')
      .orderBy('dateCreated', 'desc')
      .then( rows => {
        res.json(rows)
      })
      .catch( err => {
        console.error(err)
        res.status(503).end()
      })

}

module.exports = getAllPages
