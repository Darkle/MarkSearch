'use strict';

var MailGun = require('mailgun-es6');

var APIKEYS = require('../../../config/apikeys.json')

var mailGun = new MailGun({
  privateApi: APIKEYS.mailgunPrivateApiKey,
  publicApi: APIKEYS.mailgunPublicApiKey,
  domainName: 'mailgun.coopcoding.com'
})

function emailBookmarklet(req, res, next){
  //TODO validation
  console.log('emailBookmarklet')
  var email = JSON.parse(req.body.email)
  console.log(email)
  var bookmarkletText = req.body.bookmarkletText
  //console.log(bookmarkletText)
  mailGun.sendEmail({
    to: [email],
    from: 'bookmarklet@marksearch.local',  //TODO change this to 'bookmarklet@'+ host
    subject: 'MarkSearch Bookmarklet',
    html: `<a href="javascript:alert('hi')">MarkSearch Bookmarklet</a>`
  })
  .then(mailgunResponse => {
    console.log(`emailBookmarklet mailgun response: ${mailgunResponse.message}`)
    res.status(200).end()
  })
  .catch(err => {
    console.err(err)
    res.status(500).end()
  })
}

module.exports = emailBookmarklet