'use strict';

var moment = require('moment')
var MailGun = require('mailgun-es6')

var appSettings = require('../db/appSettings')
var pagesdb = require('../db/pagesdb')
var APIKEYS = require('../../config/apikeys.json')

var bookmarkExpiry = {}
var setTimeoutRef = null
var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.com'
})


function shouldWeRunBookmarkExpiryCheck() {
  var bookmarkExpiryLastCheck = appSettings.settings.bookmarkExpiryLastCheck
  var bookmarkExpiryMonths = appSettings.settings.bookmarkExpiryMonths
  return moment(bookmarkExpiryLastCheck).add(bookmarkExpiryMonths, 'M').valueOf() < Date.now()
}

function checkForExpiredBookmarks() {
  var expiryTimestamp = Date.now()
  pagesdb.db('pages')
    .where('dateCreated', '<', expiryTimestamp)
    .where('checkedForExpiry', 0)
    .orderBy('dateCreated', 'desc')
    .then( rows => {
      if(rows.length){
        return pagesdb.db('pages')
          .where('dateCreated', '<', expiryTimestamp)
          .where('checkedForExpiry', 0)
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
  //TODO change from to 'bookmarklet@'+ host
  //TODO for link in html get host/location dynamically - make sure its https

  var emailHtml = `

  `

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
  if(Boolean(appSettings.settings.bookmarkExpiryEnabled)){
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
    }, 10800000)
  }
}

bookmarkExpiry.stopBookmarksExpiry = () => {
  if(setTimeoutRef){
    clearTimeout(setTimeoutRef)
    setTimeoutRef = null
  }
}

module.exports = bookmarkExpiry