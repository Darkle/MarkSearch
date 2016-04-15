'use strict'

var pagesdb = require('../../db/pagesdb')
var appLogger = require('../../utils/appLogger')
var bookmarkExpiry = require('../bookmarkExpiry')

function deletePage(req, res) {
  pagesdb
    .deleteRow(req.params.pageUrl)
    .then(() => {
      res.status(200).end()
      /****
       * We also need to remove the bookmark we just deleted from the
       * bookmarkExpiry.mostRecentlyExpiredBookmarks (if it's there), so
       * it doesn't show up on the /removeOldBookmarks page if it has already
       * been deleted.
       */
      bookmarkExpiry.removeBookmarkFromMostRecentlyExpiredBookmarks(req.params.pageUrl)
    })
    .catch( err => {
      console.error(err)
      appLogger.log.error({err, req, res})
      res.status(500).end()
    })
}

module.exports = deletePage