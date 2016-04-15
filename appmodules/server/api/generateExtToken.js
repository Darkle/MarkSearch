'use strict'

var generateJWTtoken = require('../../utils/generateJWTtoken')

function generateExtToken(req, res) {
  var token = generateJWTtoken()
  res.json({
    protocolIpandPort: global.msServerAddr.combined,
    token: token
  })
}

module.exports = generateExtToken
