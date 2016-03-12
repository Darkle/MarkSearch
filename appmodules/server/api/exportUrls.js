'use strict';

var pagesdb = require('../../db/pagesdb')

function exportUrls(req, res, next){

  var exportType = req.body.exportType
  var filePath = req.body.filePath

  pagesdb.db('pages')
    .orderBy('dateCreated', 'desc')
    .then( rows => {
      res.json(rows)
      if(exportType === 'HTML'){
        var bookmarks = {
          "MarkSearch Bookmarks": {
            "contents": {}
          }
        }
        _.each(rows, pageData => {
          if(!pageData.pageTitle || !_.trim(pageData.pageTitle).length){
            pageData.pageTitle = pageData.pageDomain + _.random(0, 1000000)
          }
          bookmarks["MarkSearch Bookmarks"].contents[pageData.pageTitle] = pageData.pageUrl
        })

      }
      else if(exportType === 'Text'){

      }
      else if(exportType === 'PlainHTML'){

      }
    })
    .catch( err => {
      console.error(err)
      res.status(500).json({errorMessage: err.message})
    })
}

module.exports = exportUrls