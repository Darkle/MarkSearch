'use strict';

var moment = require('moment')
var MailGun = require('mailgun-es6')
var _ = require('lodash')

var appSettings = require('../db/appSettings')
var pagesdb = require('../db/pagesdb')
var APIKEYS = require('../../config/apikeys.json')
var appLogger = require('../utils/appLogger')

var bookmarkExpiry = {}
var setTimeoutRef = null
var checkInterval = moment().add(3, 'hours') - moment()
var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.com'
})

function shouldWeRunBookmarkExpiryCheck() {
  var bookmarkExpiryLastCheck = appSettings.settings.bookmarkExpiryLastCheck
  var bookmarkExpiryMonths = appSettings.settings.bookmarkExpiryMonths
  var timestampMonthsFromLastCheck = moment(bookmarkExpiryLastCheck).add(bookmarkExpiryMonths, 'months').valueOf()
  return timestampMonthsFromLastCheck < Date.now()
}

/****
 * sendExpiredBookmarksEmail needs to be inside the if(rows.length){,
 * also, put appSettings.update() before sendExpiredBookmarksEmail so it definately runs
 * and doesn't get skipped if sendExpiredBookmarksEmail errors.
 * .where('checkedForExpiry', 0) is checking against 0 because SQLite stores Boolean values
 * as a 0 for false or 1 for true.
 *
 * note: the ".where(function() {}" needs to be a regular function or the "this" context is wrong
 */
function checkForExpiredBookmarks() {
  var now = Date.now()
  bookmarkExpiry.getAllExpiredBookmarks()
    .then( rows => {
      if(rows.length){
        return pagesdb.db('pages')
          .where('dateCreated', '<', now)
          .where(function() {
            this.where('checkedForExpiry', 0)
              .orWhere('checkedForExpiry', null)
          })
          .update({
            checkedForExpiry: true
          })
          .then(() => appSettings.update({bookmarkExpiryLastCheck: now}))
          .then(() => {
            sendExpiredBookmarksEmail(rows)
          })
      }
    })
    .catch(err => {
      console.error(err)
      appLogger.log.error({err})
    })
}
 
function sendExpiredBookmarksEmail(rows) {
  var emailHtml = `
      <div style="font-size: 1rem; margin-bottom: 1rem;">The following are bookmarks from MarkSearch that are older than
    ${appSettings.settings.bookmarkExpiryMonths} Months (and have not been checked before).</div>
     <div style="font-size: 1rem">You can click this link to go to a page where you can remove them from MarkSearch:
     </div>
     <a style="font-size: 1rem" href="${global.msServerAddr.combined}/removeOldBookmarks">MarkSearch Bookmark Expiry Page</a>
     <h3 style="margin-top: 3rem;">Bookmarks:</h3>`

  _.each(rows, row => {
    emailHtml += `<p>
        <div style="font-size: 1rem">${row.pageTitle}</div>
        <div style="font-size: 1rem;margin: 0.2rem 0;">${row.pageUrl}</div>
        <div style="font-size: 0.9rem;opacity: 0.6;color: #7A7A7A;">Date Created: ${moment(row.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")}</div>
      </p>`
  })
  mailGun.sendEmail({
    to: [appSettings.settings.bookmarkExpiryEmail],
    from: 'expiry@marksearch.local',
    subject: 'Expired MarkSearch Bookmarks',
    html: emailHtml
  })
  .catch(err => {
    console.error(err)
    appLogger.log.error({err})
  })
}

bookmarkExpiry.init = () => {
  bookmarkExpiry.stopBookmarksExpiry()
  if(appSettings.settings.bookmarkExpiryEnabled){
    /****
     * If it's been longer than the expiry time set since last checked,
     * run straight away.
     */
    if(shouldWeRunBookmarkExpiryCheck()){
      checkForExpiredBookmarks()
    }
    /****
     * So we're doing a minimal check every 3 hours
     */
    setTimeoutRef = setTimeout(() => {
      if(shouldWeRunBookmarkExpiryCheck()){
        checkForExpiredBookmarks()
      }
    }, checkInterval)
  }
}

bookmarkExpiry.stopBookmarksExpiry = () => {
  if(setTimeoutRef){
    clearTimeout(setTimeoutRef)
    setTimeoutRef = null
  }
}

/****
 * .orderBy('dateCreated', 'desc') is for when the removeOldBookmarks calls
 * bookmarkExpiry.getAllExpiredBookmarks.
 */
bookmarkExpiry.getAllExpiredBookmarks = () => {
  var now = Date.now()
  return pagesdb.db('pages')
    .where('dateCreated', '<', now)
    .where(function() {
      this.where('checkedForExpiry', 0)
        .orWhere('checkedForExpiry', null)
    })
    .orderBy('dateCreated', 'desc')
}

module.exports = bookmarkExpiry