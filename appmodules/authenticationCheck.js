'use strict';

var jwt = require('jsonwebtoken')

function authenticationCheck(req, res, next){
  var authHeader = req.get('Authorization')
  if(!authHeader){
    console.log('Request missing Authorization header.')
    return res.status(403).end()
  }
  var token = authHeader.replace('Bearer ', '')
  jwt.verify(token, req.app.get('JWTsecret'), (err, decoded) => {
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