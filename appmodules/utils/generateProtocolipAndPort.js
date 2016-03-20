'use strict';

var internalIp = require('internal-ip')

//TODO - do i still need this? double check and if not, remove it and fix up all calls to it
function generateProtocolIpAndPort(req){
  var port = req.app.get('port') || ''
  /****
   * I think this should still work ok if there is no port - e.g. "http://marksearch.local:" should
   * work (i think)
   */
  return `${req.protocol}://${internalIp.v4()}:${port}`
}

module.exports = generateProtocolIpAndPort