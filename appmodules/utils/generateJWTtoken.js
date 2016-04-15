'use strict'

var jwt = require('jsonwebtoken')
var _ = require('lodash')

var appSettings = require('../db/appSettings')

function generateJWTtoken() {
  return jwt.sign(
    {
      client: `MarkSearch Extension/Bookmarklet_${ _.random(0, 100) }`
    },
    appSettings.settings.JWTsecret
  )
}

module.exports = generateJWTtoken