'use strict';

var http = require('http')

var getPort = require('get-port')

var isPortInUse = require('../utils/isPortInUse')
var appSettings = require('../db/appSettings')

function initServer(expressApp){
  /****
   * A port could be available for the ipv4 address but be in use on the loopback
   * address, so check all loopback addresses as well as the ipv4 address.
   */
  return Promise.all([
      isPortInUse(appSettings.settings.serverPort, '::1'),
      isPortInUse(appSettings.settings.serverPort, '127.0.0.1'),
      isPortInUse(appSettings.settings.serverPort, '0.0.0.0')
    ])
    .then(hostsPortInUse => {
      if(hostsPortInUse.some(portInUse => portInUse)){
        /****
         * Get a new port if the one we were going to use is already in use,
         * and save the new one to the appSettings db.
         */
        return getPort()
                .then(newServerPort => appSettings.update({serverPort: newServerPort}))
      }
    })
    .then(() => {
      return new Promise( (resolve, reject) => {
        var server = http.createServer(expressApp)
        server.listen(appSettings.settings.serverPort)
          .on('listening', () => resolve(server.address()))
          .on('error', reject)
      })
    })
    .then(serverAddressDetails => {
      /****
       * Assing the MarkSearch server host & port details to a global
       * variable.
       */
      global.msServerAddr = {
        hostAddress: serverAddressDetails.address,
        port: appSettings.settings.serverPort
      }
      if(serverAddressDetails.family.toLowerCase() === 'ipv6'){
        /****
         * ipv6 addresses need to be wrapped in square brackets to be able to be used
         * in the browser address bar.
         */
        global.msServerAddr.hostAddress = `[${global.msServerAddr.hostAddress}]`
      }
      global.msServerAddr.combined = `http://${global.msServerAddr.hostAddress}:${global.msServerAddr.port}`
      console.info(`Marksearch server listening on: ${global.msServerAddr.combined}`)
    })
}


module.exports = initServer
