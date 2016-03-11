'use strict';

var MailGun = require('mailgun-es6');

var generateProtocolIpAndPort = require('../../utils/generateProtocolIpAndPort')
var APIKEYS = require('../../../config/apikeys.json')

var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.com'
})

function emailBookmarklet(req, res, next){
  var protocolIpandPort = generateProtocolIpAndPort(req)
  //TODO validation
  var email = JSON.parse(req.body.email)
  mailGun.validateEmail(email)
  .then(res => {
    if(!res.is_valid){
      throw new Error('not a valid email address')
    }
    else {
      //TODO change from to 'bookmarklet@'+ host
      //TODO for link in html get host/location dynamically - make sure its https
      return mailGun.sendEmail({
        to: [email],
        from: 'bookmarklet@marksearch.local',
        subject: 'MarkSearch Bookmarklet',
        html: `Open this page in your mobile device, then bookmark the link shown on that page: <a href="${protocolIpandPort}/bookmarklet">${protocolIpandPort}/bookmarklet</a>`
      })
    }
  })
  .then(mailgunResponse => {
    console.log(`emailBookmarklet mailgun response: ${mailgunResponse.message}`)
    res.status(200).end()
  })
  .catch(err => {
    console.error(err)
    res.status(500).json(JSON.stringify(err.message))
  })
}

module.exports = emailBookmarklet