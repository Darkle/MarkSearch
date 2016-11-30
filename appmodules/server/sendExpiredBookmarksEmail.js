
var MailGun = require('mailgun-es6')
var _ = require('lodash')
var moment = require('moment')
/****
 * https://github.com/cure53/DOMPurify/pull/60
 */
var document = require('jsdom').jsdom('', {
  FetchExternalResources: false,
  ProcessExternalResources: false
})
var DOMPurify = require('dompurify')(document.defaultView)

var APIKEYS = require('../../config/apikeys.json')
var appSettings = require('../db/appSettings')
var appLogger = require('../utils/appLogger')

var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.space'
})

/****
 * DOMPurify.sanitize() in case of any stored XSS
 */
function sendExpiredBookmarksEmail(rows) {
  var emailHtml = `
      <div style="font-size: 1rem; margin-bottom: 1rem;">The following are bookmarks from MarkSearch that are older than
    ${ DOMPurify.sanitize(appSettings.settings.bookmarkExpiryMonths) } Months (and have not been checked before).</div>
     <div style="font-size: 1rem">You can click this link to go to a page where you can remove them from MarkSearch:
     </div>
     <a style="font-size: 1rem" href="${ global.msServerAddr.combined }/removeOldBookmarks">MarkSearch Bookmark Expiry Page</a>
     <h3 style="margin-top: 3rem;">Bookmarks:</h3>`

  _.each(rows, row => {
    emailHtml += `<p>
        <div style="font-size: 1rem">${ DOMPurify.sanitize(row.pageTitle) }</div>
        <div style="font-size: 1rem;margin: 0.2rem 0;">${ DOMPurify.sanitize(row.pageUrl) }</div>
        <div style="font-size: 0.9rem;opacity: 0.6;color: #7A7A7A;">
          Date Created: ${ DOMPurify.sanitize(moment(row.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")) }
        </div>
      </p>`
  })
  mailGun.sendEmail({
      to: [appSettings.settings.bookmarkExpiryEmail],
      from: 'marksearch.expiry@marksearch.local',
      subject: 'Expired MarkSearch Bookmarks',
      html: emailHtml
    })
    .catch(err => {
      global.devMode && console.error(err)
      appLogger.log.error({err})
    })
}

module.exports = sendExpiredBookmarksEmail
