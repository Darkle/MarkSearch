'use strict';

var path = require('path')

var debug = require('debug')('MarkSearch:deletePage')

function deletePage(req, res, next) {
  debug('deletePage running')
  debug(req.params.pageUrl)
  var db = req.app.get('pagesDB')
  db.get(req.params.pageUrl)
      .then( doc => db.remove(doc) )
      .then( result => {
        /*****
         * return a 200
         * http://stackoverflow.com/questions/2342579/
         */
        console.log("removed page from db")
        res.status(200).json({pageDeleted: result.id})
      })
      .then( result =>
        /****
         * update the quick-search index
         */
        db.search({fields: ['pageTitle', 'pageDescription', 'pageText'], build: true})
      )
      .then(() => {
        debug('Re-built search index afted page delete')
      })
      .catch( err => {
        console.error(err)
        res.status(503).end()
      })
}

module.exports = deletePage