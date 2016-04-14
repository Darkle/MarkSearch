'use strict';

var bookmarkExpiry = require('../bookmarkExpiry')
var appLogger = require('../../utils/appLogger')

function getExpiredBookmarksForFrontend(req, res, next){
  res.json(bookmarkExpiry.mostRecentlyExpiredBookmarks)
}

module.exports = getExpiredBookmarksForFrontend