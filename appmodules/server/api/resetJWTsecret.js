'use strict';

var Crypto = require('crypto')

var appSettings = require('../../db/appSettings')

function resetJWTsecret(req, res, next){
  appSettings.db('appSettings')
    .where('id', 'appSettings')
    .update({
      JWTsecret: Crypto.randomBytes(128).toString('hex')
    })
    .return(appSettings.db('appSettings').where('id', 'appSettings'))
    .then( rows => {
      appSettings.settings.JWTsecret = rows[0].JWTsecret
      res.status(200).end()
    })
    .catch(err => {
      res.status(500).json({
        errorMessage: 'There was an error resetting JWT secret.'
      })
    })
}

module.exports = resetJWTsecret