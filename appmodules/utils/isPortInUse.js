'use strict'

/****
 * es5 version of https://github.com/Urucas/is-port-taken/blob/master/lib%2Fcheck.js
 */

var net = require('net')

function isPortInUse(port, host) {
  return new Promise(resolve => {
    var server = net.createServer(null, () => {
      // do nothing
    })

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE'){
        resolve(true)
      }
      else{
        resolve(false)
      }
    })

    server.listen(port, host, (err) => {
      server.close()
      if(err && err.code === 'EADDRINUSE'){
        resolve(true)
      }
      else{
        resolve(false)
      }
    })

  })
}

module.exports = isPortInUse