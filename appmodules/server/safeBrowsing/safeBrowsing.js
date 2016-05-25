'use strict'

var request = require('request')
var electron = require('electron')

var APIKEYS = require('../../../config/apikeys.json')
var safeBrowsingDetails = require('./safeBrowsingTemplates')

var electronApp = electron.app
/***
 * Using https://developers.google.com/safe-browsing/lookup_guide
 * 'unwanted' is unwanted software (e.g. sourceforge)
 * Can test with http://malware.testing.google.test/testing/malware/
 * http://bit.ly/1le7vTb
 */
var safeBrowsingPossibilities = ['phishing', 'malware', 'unwanted']

/****
 * Send some info in the user agent to make it easy to block/contact if needed.
 * This is the default user agent for Electron: http://bit.ly/1S5sOQ9
 * note: request doesn't send a user agent by default.
 */
var uAgent = `Mozilla/5.0 AppleWebKit (KHTML, like Gecko) Chrome/${ process.versions['chrome'] } Electron/${ process.versions['electron'] } Safari MarkSearch App https://github.com/Darkle/MarkSearch`

function safeBrowsingCheck(pageUrl) {
  return new Promise(resolve => {
    var safeBrowsingData = null
    var safeBrowsingUrl = 'https://sb-ssl.google.com/safebrowsing/api/lookup?' +
        'client=' + electronApp.getName() +
        '&key=' + APIKEYS.safeBrowsing +
        '&appver=' + electronApp.getVersion() +
        '&pver=3.1' +
        '&url=' + encodeURIComponent(pageUrl)

    request({
        url: safeBrowsingUrl,
        headers: {
          'User-Agent': uAgent
        }
      },
      (error, response, responseBody) => {
        /****
         * We're not doing a reject here as the archive.is request may have succeded and
         * we want to check in the next .then() if there is any data to save and then save
         * it to the db.
         */
        if(error){
          global.devMode && console.error("Couldn't get safebrowsing details :", error)
        }
        else{
          /****
           * https://developers.google.com/safe-browsing/lookup_guide
           * 200: The queried URL is either phishing,
           * malware, unwanted or a combination of those three; see the
           * response body for the specific type.
           * We only add and if it gets a 200 response
           */
          if(response.statusCode === 200){
            var safeBrowsingPossibilitiesReturned = {}
            safeBrowsingPossibilities.forEach( malP => {
              if(responseBody.indexOf(malP) > -1){
                safeBrowsingPossibilitiesReturned[malP] = safeBrowsingDetails[malP]
              }
            })
            safeBrowsingData = {
              safeBrowsing: {
                details: safeBrowsingPossibilitiesReturned,
                pageUrl: pageUrl
              }
            }
          }
        }
        resolve(safeBrowsingData)
      }
    )
  })
}


module.exports = safeBrowsingCheck