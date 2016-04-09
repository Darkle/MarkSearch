'use strict';

var http = require('http')

var getPort = require('get-port')
var internalIp = require('internal-ip')

var isPortInUse = require('../utils/isPortInUse')
var appSettings = require('../db/appSettings')

var ipv4Address = internalIp.v4()

function initServer(expressApp){
  return isPortInUse(appSettings.settings.serverPort, ipv4Address)
    .then(portInUse => {
      if(portInUse){
        /****
         * Get a new port if the one we were going to use is already in use,
         * and save the new port number to the appSettings db.
         */
        return getPort()
                .then(newServerPort => appSettings.update({serverPort: newServerPort}))
      }
    })
    .then(() => {
      return new Promise( (resolve, reject) => {
        var server = http.createServer(expressApp)
        /****
         * Need to specify the ipv4 address, otherwise it may use a
         * loopback address, which wont make it accessable by other
         * devices on the network.
         * http://bit.ly/1SnIpu2
         */
        server.listen(appSettings.settings.serverPort, ipv4Address)
          .on('listening', () => resolve(server.address()))
          .on('error', reject)
      })
    })
    .then(serverAddressDetails => {
      /****
       * Assigning the MarkSearch server host & port details to a global
       * object so its easily accessable.
       */
      global.msServerAddr = {
        hostAddress: serverAddressDetails.address,
        port: appSettings.settings.serverPort,
        combined: `http://${serverAddressDetails.address}:${appSettings.settings.serverPort}`
      }
      console.info(`Marksearch server listening on: ${global.msServerAddr.combined}`)
    })
}


module.exports = initServer
