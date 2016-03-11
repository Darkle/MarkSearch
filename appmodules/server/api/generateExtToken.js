'use strict';


var generateProtocolIpAndPort = require('../../utils/generateProtocolIpAndPort')
var generateJWTtoken = require('../../utils/generateJWTtoken')

function generateExtToken(req, res){
  /****
   * tokenType is either browserExtension or bookmarklet.
   * Give it a somewhat unique id - could be helpful for debugging.
   */
  var protocolIpandPort = generateProtocolIpAndPort(req)
  var token = generateJWTtoken()
  res.json({
    protocolIpandPort: protocolIpandPort,
    token: token
  })
}

module.exports = generateExtToken
