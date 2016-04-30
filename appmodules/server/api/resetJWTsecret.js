'use strict'

var Crypto = require('crypto')

var appSettings = require('../../db/appSettings')
var appLogger = require('../../utils/appLogger')

var randomCryptoLength = 256

function resetJWTsecret(req, res) {
  appSettings
    .update({
      JWTsecret: Crypto.randomBytes(randomCryptoLength).toString('hex')
    })
    .then(() => res.status(200).end())
    .catch(err => {
      global.devMode && console.error(err)
      appLogger.log.error({err, req, res})
      res.status(500).json({
        errorMessage: 'There was an error resetting JWT secret.'
      })
    })
}

module.exports = resetJWTsecret