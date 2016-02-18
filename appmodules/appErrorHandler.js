'use strict';

var child = require('child_process').exec

var electron = require('electron')
var debug = require('debug')('MarkSearch:appErrorHandler')

function appErrorHandler(err){
  debug(err.message)
  debug(err.stack)
  debug(err)
  console.error(err.message)
  console.error(err.stack)
  console.error(err)
  /****
   * If electron errors, then  it's possible showMessageBox may not be available
   */
  try{
    var dialog = electron.dialog
    dialog.showMessageBox({
          title: 'An Error Occured With MarkSearch',
          message: 'An Error Occured With MarkSearch',
          buttons: ['Restart MarkSearch', 'Cancel'],
          cancelId: 1,
          detail: `${err.message}
                  ${err.stack}`
        },
        function(response) {
          console.log(`showMessageBox response: ${response}`)
          //var electronDetach = require('electron-detach')
          //electronDetach()
          /****
           * https://www.google.com.au/search?q=electron+restart
           * https://github.com/atom/electron/issues/539
           * https://github.com/atom/electron/issues/3524
           * https://github.com/atom/electron/issues/3813
           * https://github.com/itchio/itch/issues/109
           * https://github.com/atom/electron/pull/4047
           */
          //if(response === 0){
          //
          //  var applicationPath, endIndex = process.resourcesPath.indexOf('/Contents')
          //  applicationPath = process.resourcesPath.substring(0, endIndex) // Entire app path. param 1
          //  var appToKill = 'Electron'; // assuming appName for testing purpose, param 2
          //
          //  console.log('Application Path to START : ' + applicationPath)
          //  console.log('appInit.js file path : ' + path.join(__dirname, '..', 'appInit.js'))
          //  applicationPath = path.join(__dirname, '..', 'appInit.js')
          //  //we are passing process id for future reference
          //  var daemon = child('sh restart.sh ' + applicationPath + ' ' + appToKill, function(err, stdout, stderr) {
          //    if (err) {
          //      console.log(err)
          //    }
          //    console.error("STDOUT :", stdout)
          //    console.warn("STDERR : ", stderr)
          //  })
          //}

        }
    )
  }
  catch(e){}

}

module.exports = appErrorHandler