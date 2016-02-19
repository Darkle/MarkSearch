'use strict';

var debug = require('debug')('MarkSearch:deletePage')

var pagesdb = require('../../db/pagesdb')

function deletePage(req, res, next) {
  debug('deletePage running')
  debug(req.params.pageUrl)
  //TODO - validation on req.params.pageUrl
  pagesdb.db('pages')
      .where('pageUrl', req.params.pageUrl)
      .del(numRowsAffected => {
        debug(`delete - numRowsAffected: ${numRowsAffected}`)
        /*****
         * return a 200
         * http://stackoverflow.com/questions/2342579/
         */
        res.status(200).end()
      })
      .catch( err => {
        console.error(err)
        res.status(503).end()
      })
}

module.exports = deletePage