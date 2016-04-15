'use strict'

var bookmarkExpiry = require('../bookmarkExpiry')

function getMostRecentlyExpiredBookmarks(req, res) {
  res.json(bookmarkExpiry.mostRecentlyExpiredBookmarks)
}

module.exports = getMostRecentlyExpiredBookmarks