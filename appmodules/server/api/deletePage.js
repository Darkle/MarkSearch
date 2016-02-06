'use strict';

var path = require('path')

var debug = require('debug')('MarkSearch:deletePage')

var buildIndex = require(path.join('..', '..', 'db', 'buildIndex'))

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
      /****
       * (Re)build the quick-search index
       */
      .then( result => buildIndex(db, 'deletePage'))
      .catch( err => {
        console.error(err)
        if(res){
          res.status(503).end()
        }
      })
}

module.exports = deletePage