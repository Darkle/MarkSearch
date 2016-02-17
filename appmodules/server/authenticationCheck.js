'use strict';

var path = require('path')

var jwt = require('jsonwebtoken')

var JWTsecret = require('../db/appSettings').settings.JWTsecret

function authenticationCheck(req, res, next){
  var token = req.get('Authorization') || req.body.JWT
  if(!token){
    console.log('Request missing Authorization Header or JWT post body data.')
    return res.status(403).end()
  }
  if(token.startsWith('Bearer ')){
    token = token.replace('Bearer ', '')
  }
  jwt.verify(token, JWTsecret, (err, decoded) => {
    if(err) {
      console.log('Failed to authenticate token.')
      console.error(err)
      return res.status(403).end()
    }
    else{
      req.decoded = decoded
      next()
    }
  })
}

module.exports = authenticationCheck