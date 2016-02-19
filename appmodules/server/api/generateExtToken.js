'use strict';

var jwt = require('jsonwebtoken')
var debug = require('debug')('MarkSearch:generateExtToken')
var _ = require('lodash')
require('lodash-migrate')

var appSettings = require('../../db/appSettings')

function generateExtToken(req, res, next){
  debug("generateExtToken")
  /****
   * tokenType is either browserExtension or bookmarklet.
   * Give it a somewhat unique id - could be helpful for debugging, so
   * can see which client is accessing the api.
   */
      //TODO - validation of req.body.tokenType
  var token = jwt.sign(
      {
        client: `${req.body.tokenType}_${_.random(0, 100)}`
      },
      appSettings.settings.JWTsecret
  )
  res.json({token: token})
}

module.exports = generateExtToken
