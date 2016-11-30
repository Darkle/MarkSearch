'use strict'

var MailGun = require('mailgun-es6')

var APIKEYS = require('../../../config/apikeys.json')
var appLogger = require('../../utils/appLogger')

var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.space'
})

function emailBookmarklet(req, res) {
  /****
   * req.body.email is validated in requestDataValidation.js
   */
  mailGun.sendEmail({
      to: [req.body.email],
      from: 'marksearch.bookmarklet@marksearch.local',
      subject: 'MarkSearch Bookmarklet',
      html: `<div style="font-size: 1rem; margin-bottom: 1rem;">
                Open the page below on your mobile device, then bookmark the link shown on that page:
               </div>
              <a style="font-size: 1rem;" href="${ global.msServerAddr.combined }/bookmarklet">${ global.msServerAddr.combined }/bookmarklet</a>
                `
    })
  .then(mailgunResponse => {
    global.devMode && console.log(`emailBookmarklet mailgun response: ${ mailgunResponse.message }`)
    res.status(200).end()
  })
  .catch(err => {
    global.devMode && console.error(err)
    appLogger.log.error({err, req, res})
    res.status(500).json(
      {
        errorMessage: JSON.stringify(err.message)
      }
    )
  })
}

module.exports = emailBookmarklet
