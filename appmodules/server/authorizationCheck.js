'use strict'

var jwt = require('jsonwebtoken')

var appSettings = require('../db/appSettings')
var appLogger = require('../utils/appLogger')

function authorizationCheck(req, res, next) {
  var token = req.get('Authorization') || req.body.JWT
  if(!token){
    global.devMode && console.log('Request missing Authorization Header or JWT post body data.')
    return res.status(403).end()
  }
  if(token.startsWith('Bearer ')){
    token = token.replace('Bearer ', '')
  }
  jwt.verify(token, appSettings.settings.JWTsecret, (err, decoded) => {
    if(err){
      global.devMode && console.log('Failed to authenticate token.')
      global.devMode && console.error(err)
      appLogger.log.error({err, req, res})
      return res.status(403).end()
    }
    req.decoded = decoded
    return next()
  })
}

module.exports = authorizationCheck