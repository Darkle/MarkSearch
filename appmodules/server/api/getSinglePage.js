'use strict';

var pagesdb = require('../../db/pagesdb')

function getSinglePage(req, res, next) {
  //TODO - validate req.params.pageUrl

  pagesdb.db('pages')
      .where('pageUrl', req.params.pageUrl)
      .then( rows => {
        if(!rows[0]){
          res.status(404).end()
        }
        else{
          res.json(rows[0])
        }
      })
      .catch( err => {
        console.error(err)
        res.status(500).end()
      })

}

module.exports = getSinglePage