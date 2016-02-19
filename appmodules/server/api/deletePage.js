'use strict';

var pagesdb = require('../../db/pagesdb')

function deletePage(req, res, next) {
  //TODO - validation on req.params.pageUrl
  pagesdb.db('pages')
      .where('pageUrl', req.params.pageUrl)
      .del(numRowsAffected => {
        /*****
         * return a 200
         * http://stackoverflow.com/questions/2342579/
         */
        res.status(200).end()
      })
      .catch( err => {
        console.error(err)
        res.status(500).end()
      })
}

module.exports = deletePage