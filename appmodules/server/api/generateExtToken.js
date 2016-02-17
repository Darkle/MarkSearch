'use strict';

var jwt = require('jsonwebtoken')
var debug = require('debug')('MarkSearch:generateExtToken')

var JWTsecret = require('../../db/appSettings').settings.JWTsecret

function generateExtToken(req, res, next){
  debug("generateExtToken")
  /****
   * tokenType is either browserExtension or bookmarklet.
   * Give it a somewhat unique id - could be helpful for debugging, so
   * can see which client is accessing the api.
   */
  var token = jwt.sign(
      {
        client: `${req.body.tokenType}_${parseInt((Math.random() * 100), 10)}`
      },
      JWTsecret
  )
  res.json({token: token})
}

module.exports = generateExtToken
