'use strict';

var request = require('request')
var electron = require('electron')

var APIKEYS = require('../../config/apikeys.json')

var electronApp = electron.app

/***
 * Using https://developers.google.com/safe-browsing/lookup_guide
 * 'unwanted' is unwanted software (e.g. sourceforge)
 * Can test with http://malware.testing.google.test/testing/malware/
 * http://bit.ly/1le7vTb
 */

var safeBrowsingPossibilities = ['phishing', 'malware', 'unwanted']
var safeBrowsingDetails = {
  phishing: {
    bold: `Warning—Suspected phishing page.`,
    explanation: `This page may be a forgery or imitation of
                    another website, designed to trick users into sharing
                    personal or financial information. Entering any personal
                    information on this page may result in identity theft
                    or other abuse. You can find out more about phishing
                    from <a href='https://www.antiphishing.org'>www.antiphishing.org</a>.
                     - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`

  },
  malware: {
    bold: `Warning—Visiting this web site may harm your computer.`,
    explanation: `This page appears to contain malicious code that could be
                downloaded to your computer without your consent. You can
                learn more about harmful web content including viruses and
                other malicious code and how to protect your computer at
                <a href='https://StopBadware.org'>StopBadware.org</a>.
                  - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`

  },
  unwanted: {
    bold: `Warning—The site ahead may contain harmful programs.`,
    explanation: `Attackers might attempt to trick you into installing programs
                that harm your browsing experience (for example, by changing
                your homepage or showing extra ads on sites you visit). You
                can learn more about unwanted software at
                <a href='https://www.google.com/about/company/unwanted-software-policy.html'>https://www.google.com/about/company/unwanted-software-policy.html</a>.
                 - <a href='https://code.google.com/apis/safebrowsing/safebrowsing_faq.html#whyAdvisory'>Advisory provided by Google</a>`
  }
}

function safeBrowsingCheck(pageUrl){
  return new Promise((resolve, reject) => {
    var safeBrowsingData = null
    var safeBrowsingUrl = 'https://sb-ssl.google.com/safebrowsing/api/lookup?' +
        'client=' + electronApp.getName() +
        '&key=' + APIKEYS.safeBrowsing +
        '&appver=' + electronApp.getVersion() +
        '&pver=3.1' +
        '&url=' + encodeURIComponent(pageUrl)

    request(safeBrowsingUrl, (error, response, responseBody) =>{
      /****
       * We're not doing a reject here as we want to continue on to the
       * next promise. It's not the end of the world if
       * we dont get a safe browsing check for the page.
       */
      if(error){
        console.error("Couldn't get safebrowsing details :", error)
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
    })
  })
}


module.exports = safeBrowsingCheck