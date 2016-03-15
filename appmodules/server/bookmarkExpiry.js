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
  console.log(`bookmarkExpiryLastCheck : ${bookmarkExpiryLastCheck}`)
  console.log(`bookmarkExpiryMonths : ${bookmarkExpiryMonths}`)
  var timestampMonthsFromNow = moment(bookmarkExpiryLastCheck).add(bookmarkExpiryMonths, 'M').valueOf()
  console.log(`timestampMonthsFromNow : ${timestampMonthsFromNow}`)
  var returnValue = timestampMonthsFromNow < Date.now()
  console.log(`shouldWeRunBookmarkExpiryCheck result: ${returnValue}`)
  return returnValue
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
  console.log('checkForExpiredBookmarks running')
  var expiryTimestamp = Date.now()
  pagesdb.db('pages')
    .where('dateCreated', '<', expiryTimestamp)
    .where(function() {
      this.where('checkedForExpiry', 0)
        .orWhere('checkedForExpiry', null)
    })
    .orderBy('dateCreated', 'desc')
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

function sendExpiredBookmarksEmail(rows) {
  console.log('sendExpiredBookmarksEmail running')
  var emailHtml = `
    <style>
      .expiredBookmarkDetails {
        display: flex;
        flex-direction: column;
      }
    </style>
  `

  _.each(rows, row => {
    emailHtml += `<p class="expiredBookmarkDetails">
      <div class="pageTitle">${row.pageTitle}</div>
      <div class="pageUrl">${row.pageUrl}</div>
    </p>
    `
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
  console.log('bookmarkExpiry.init')
  bookmarkExpiry.stopBookmarksExpiry()
  if(appSettings.settings.bookmarkExpiryEnabled){
    /****
     * If it's been longer than the expiry time set since last checked,
     * run straight away.
     */
    if(shouldWeRunBookmarkExpiryCheck()){
      console.log('shouldWeRunBookmarkExpiryCheck true')
      checkForExpiredBookmarks()
    }
    /****
     * So we're doing a minimal check every 3 hours
     */
    setTimeoutRef = setTimeout(() => {
      if(shouldWeRunBookmarkExpiryCheck()){
        console.log('setTimeout shouldWeRunBookmarkExpiryCheck true')
        checkForExpiredBookmarks()
      }
    }, checkInterval)
  }
}

bookmarkExpiry.stopBookmarksExpiry = () => {
  console.log('bookmarkExpiry.stopBookmarksExpiry running')
  if(setTimeoutRef){
    clearTimeout(setTimeoutRef)
    setTimeoutRef = null
  }
}

module.exports = bookmarkExpiry