'use strict';

var path = require('path')

var Mailgun = require('mailgun-js')
var debug = require('debug')('MarkSearch:mailgun')

const APIKEYS = require(path.join('..', '..', 'config', 'apikeys.json'))

function sendEmail(emailDetails, callback){
  //TODO change the localhost to global, so marksearch.local
  var host = 'localhost:3000' //marksearch.local
  var mailgun = new Mailgun(
      {
        apiKey: APIKEYS.mailgunApiKey,
        domain: 'mailgun.coopcoding.com'
      }
  )
  var data = {
    //from: 'login@'+host,
    from: 'admin@marksearch.local',  //TODO change this to 'admin@'+ host
    to: emailDetails.recipient,
    subject: emailDetails.subject,
    html: emailDetails.html
  }
  mailgun.messages().send(data, (err, body) => {
    if (err) {
      //send back a good error message
      console.error("mailgun.messages().send got an error: ", err)
      callback(err)
    }
    else {
      //Send back success message in json
      debug('sent email')
      debug(body)
      callback()
    }
  })
}

module.exports = sendEmail