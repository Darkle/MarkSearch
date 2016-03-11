'use strict';


var generateProtocolIpAndPort = require('../../utils/generateProtocolIpAndPort')
var generateJWTtoken = require('../../utils/generateJWTtoken')

function generateExtToken(req, res){
  var protocolIpandPort = generateProtocolIpAndPort(req)
  var token = generateJWTtoken()
  res.json({
    protocolIpandPort: protocolIpandPort,
    token: token
  })
}

module.exports = generateExtToken
