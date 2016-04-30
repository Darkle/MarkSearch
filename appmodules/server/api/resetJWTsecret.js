'use strict'

var Crypto = require('crypto')

var appSettings = require('../../db/appSettings')
var appLogger = require('../../utils/appLogger')

function resetJWTsecret(req, res) {
  appSettings
    .update({
      JWTsecret: Crypto.randomBytes(256).toString('hex')
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