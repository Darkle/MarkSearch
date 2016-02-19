'use strict';

var pagesdb = require('../../db/pagesdb')

function getSinglePage(req, res, next) {
  //TODO - validate req.params.pageUrl

  pagesdb.db('pages')
      .where('pageUrl', req.params.pageUrl)
      .then( rows => {
        if(!rows[0]){
          console.log("document not found sending back a 404")
          res.status(404).end()
        }
        else{
          res.json(rows[0])
        }
      })
      .catch( err => {
        /***
         * send a 503 http error if there was an error with the database
         * (http://goo.gl/TASz7p)
         */
        console.error(err)
        res.status(503).end()
      })

}

module.exports = getSinglePage