'use strict';

var moment = require('moment')
var MailGun = require('mailgun-es6')
var _ = require('lodash')

var appSettings = require('../db/appSettings')
var pagesdb = require('../db/pagesdb')
var APIKEYS = require('../../config/apikeys.json')

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
  var expiryTimestamp = Date.now()
  pagesdb.db('pages')
    .where('dateCreated', '<', expiryTimestamp)
    .where(function() {
      this.where('checkedForExpiry', 0)
        .orWhere('checkedForExpiry', null)
    })
    .then( rows => {
      if(rows.length){
        return pagesdb.db('pages')
          .where('dateCreated', '<', expiryTimestamp)
          .where(function() {
            this.where('checkedForExpiry', 0)
              .orWhere('checkedForExpiry', null)
          })
          .update({
            checkedForExpiry: true
          })
          .then(() => appSettings.update({bookmarkExpiryLastCheck: expiryTimestamp}))
          .then(() => {
            sendExpiredBookmarksEmail(rows)
          })
      }
    })
}

//TODO need marksearch localhost/url dynamically
function sendExpiredBookmarksEmail(rows) {
  var emailHtml = `
      <div>The following are bookmarks from MarkSearch that are older than
    ${appSettings.settings.bookmarkExpiryMonths} Months (and have not been checked before).</div>
     <div>You can click this link to go to a page where you can remove some or all of them from MarkSearch:
     <a href="http://localhost:3020/emailDeletePage">MarkSearch Bookmark Expiry Page</a>
     </div>
     <h3>Expired Bookmarks:</h3>`

  _.each(rows, row => {
    emailHtml += `<p><div>${row.pageTitle}</div><div>${row.pageUrl}</div></p>`
  })
  //TODO change from to 'expiry@'+ host and get host dynamically
  mailGun.sendEmail({
    to: [appSettings.settings.bookmarkExpiryEmail],
    from: 'expiry@marksearch.local',
    subject: 'Expired MarkSearch Bookmarks',
    html: emailHtml
  })
  .catch(err => {
    console.error(err)
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

module.exports = bookmarkExpiry