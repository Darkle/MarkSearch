'use strict';

var _ = require('lodash')
var debug = require('debug')('MarkSearch:getAllPages')

function getAllPages(req, res, next) {
  debug('getAllPages running')
  var db = req.app.get('pagesDB')
  /****
   * Using allDocs and sorting myself as it seems to be quicker than using
   * pouchdb-find plugin & a second index. (did some tests with
   * db.allDocs vs. db.find using console.time())
   */
  db.allDocs({
    include_docs: true
  }).then( documents => {
    /****
     * sort them so most recent first
     * Using lodash sort here as its a bit faster than native sort
     */
    documents.rows = _.sortBy(documents.rows, document => -document.doc.dateCreated)
    res.json(documents)
  }).catch( err => {
    console.error(err)
    res.status(503).end()
  })
}

module.exports = getAllPages