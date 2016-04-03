'use strict';

var MailGun = require('mailgun-es6')

var APIKEYS = require('../../../config/apikeys.json')
var appLogger = require('../../utils/appLogger')

var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.com'
})

function emailBookmarklet(req, res, next){
  var email = JSON.parse(req.body.email)
  
  mailGun.validateEmail(email)
  .then(res => {
    if(!res.is_valid){
      throw new Error('not a valid email address')
    }
    else {
      return mailGun.sendEmail({
        to: [email],
        from: 'bookmarklet@marksearch.local',
        subject: 'MarkSearch Bookmarklet',
        html: `<div style="font-size: 1rem; margin-bottom: 1rem;">
                Open the page below in your mobile device, then bookmark the link shown on that page:
               </div>
              <a style="font-size: 1rem;" href="${global.msServerAddr.combined}/bookmarklet">${global.msServerAddr.combined}/bookmarklet</a>
                `
      })
    }
  })
  .then(mailgunResponse => {
    console.log(`emailBookmarklet mailgun response: ${mailgunResponse.message}`)
    res.status(200).end()
  })
  .catch(err => {
    console.error(err)
    appLogger.log.error({err})
    res.status(500).json(
      {
        errorMessage: JSON.stringify(err.message)
      }
    )
  })
}

module.exports = emailBookmarklet