'use strict'

var moment = require('moment')
var _ = require('lodash')
var ms = require('ms')

var appSettings = require('../db/appSettings')
var pagesdb = require('../db/pagesdb')
var appLogger = require('../utils/appLogger')
var sendExpiredBookmarksEmail = require('./sendExpiredBookmarksEmail')

var bookmarkExpiry = {
  mostRecentlyExpiredBookmarks: []
}
var setTimeoutRef = null
var checkInterval = 2000

function shouldWeRunBookmarkExpiryCheck() {
  if(!appSettings.settings.bookmarkExpiryEnabled){
    return false
  }
  /****
   * If now is later than (the last time we checked plus 3 months or 6 months).
   */
  var bookmarkExpiryLastCheck = appSettings.settings.bookmarkExpiryLastCheck
  var bookmarkExpiryMonths = appSettings.settings.bookmarkExpiryMonths
  var timestampMonthsFromLastCheck = moment(bookmarkExpiryLastCheck).add(bookmarkExpiryMonths, 'months').valueOf()
  return Date.now() > timestampMonthsFromLastCheck
}
/****
 * sendExpiredBookmarksEmail needs to be inside the if(rows.length){.
 * Put updateCheckedForExpiryColumn() before sendExpiredBookmarksEmail() so it definately runs
 * and doesn't get skipped if sendExpiredBookmarksEmail() errors.
 */
function checkForExpiredBookmarks() {
  var expiryDate = moment().subtract(appSettings.settings.bookmarkExpiryMonths, 'months').valueOf()
  bookmarkExpiry.getAllExpiredBookmarks(expiryDate)
    .then( rows => {
      bookmarkExpiry.mostRecentlyExpiredBookmarks = rows
      if(rows.length){
        return bookmarkExpiry.updateCheckedForExpiryColumn(expiryDate)
          .then(() => appSettings.update({bookmarkExpiryLastCheck: Date.now()}))
          .then(() => {
            sendExpiredBookmarksEmail(rows)
          })
      }
    })
    .catch(err => {
      global.devMode && console.error(err)
      appLogger.log.error({err})
    })
}
/****
 * .orderBy('dateCreated', 'asc') is for router.post('/frontendapi/getMostRecentlyExpiredBookmarks/' -
 * oldest to newest.
 *
 * .where('checkedForExpiry', 0) is checking against 0 because SQLite stores Boolean values
 * as a 0 for false or 1 for true.
 *
 * note: the ".where(function() {}" needs to be a regular function or the "this" context is wrong
 */
bookmarkExpiry.getAllExpiredBookmarks = (expiryDate) =>
  pagesdb
    .db('pages')
    .where('dateCreated', '<', expiryDate)
    .where(function() {
      this.where('checkedForExpiry', 0)
        .orWhere('checkedForExpiry', null)
    })
    .orderBy('dateCreated', 'asc')

/*****
* .update() doesn't return the rows it updated, only the number of rows - that's
* why we we need a seperate db query in getAllExpiredBookmarks(). We need the rows to send
* through to sendExpiredBookmarksEmail().
*
* .where('checkedForExpiry', 0) is checking against 0 because SQLite stores Boolean values
* as a 0 for false or 1 for true.
*
* note: the ".where(function() {}" needs to be a regular function or the "this" context is wrong
*/
bookmarkExpiry.updateCheckedForExpiryColumn = (expiryDate) =>
  pagesdb
    .db('pages')
    .where('dateCreated', '<', expiryDate)
    .where(function() {
      this.where('checkedForExpiry', 0)
        .orWhere('checkedForExpiry', null)
    })
    .update({
      checkedForExpiry: true
    })


/*****
* This is called from deletePage.js - more details in there.
*/
bookmarkExpiry.removeBookmarkFromMostRecentlyExpiredBookmarks = (bookmarkUrl) => {
  _.pull(
    bookmarkExpiry.mostRecentlyExpiredBookmarks,
    _.find(bookmarkExpiry.mostRecentlyExpiredBookmarks, { 'pageUrl': bookmarkUrl })
  )
}

bookmarkExpiry.init = () => {
  if(setTimeoutRef){
    clearTimeout(setTimeoutRef)
    setTimeoutRef = null
  }
  /****
   * So we're doing a minimal check every 3 hours
   */
  setTimeoutRef = setTimeout(() => {
    if(shouldWeRunBookmarkExpiryCheck()){
      checkForExpiredBookmarks()
    }
    bookmarkExpiry.init()
  }, checkInterval)

}

module.exports = bookmarkExpiry
