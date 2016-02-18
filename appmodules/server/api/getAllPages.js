'use strict';

var debug = require('debug')('MarkSearch:getAllPages')

var pagesdb = require('../../db/pagesdb')

function getAllPages(req, res, next) {
  debug('getAllPages running')
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
