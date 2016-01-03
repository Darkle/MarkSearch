'use strict';

var debug = require('debug')('MarkSearch:getSinglePage')

function getSinglePage(req, res, next) {
  debug('getSinglePage running')
  debug(req.params.pageUrl)
  var db = req.app.get('pagesDB')
  db.get(req.params.pageUrl).then( doc => {
    res.json(doc)
  }).catch( err => {
    //Send a 404 status code if not found in db
    if(err.status === 404){
      debug("document not found sending back a 404")
      res.status(404).end()
    }
    else {
      /***
       * send a 503 http error if there was an error with the database
       * (http://goo.gl/TASz7p)
       */
      console.error(err)
      res.status(503).end()
    }
  })
}

module.exports = getSinglePage