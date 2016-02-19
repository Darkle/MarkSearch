'use strict';

var request = require('request')
var _ = require('lodash')

function generateArchiveOfPage(pageUrl){
  return new Promise((resolve, reject) => {
    var returnedData = null
    request.post({
          url: 'https://archive.is/submit/',
          form: {url: pageUrl}
        },
        (err, httpResponse, body) => {
          var locationHeader = _.get(httpResponse, 'headers.location')
          if(err || !locationHeader){
            console.error("Couldn't get an archive.is backup:", err)
            /****
             * We're not doing a reject here as we want to continue on to the
             * next promise (safeBrowsing). It's not the end of the world if
             * we dont get an archive link for the page.
             * Also, we dont want to send an error back to the calling "then" as
             * we are saving that for database errors on the
             */
          }
          else{
            returnedData = {
              archiveLink: httpResponse.headers.location,
              pageUrl: pageUrl
            }
          }
          resolve(returnedData)
        }
    )
  })
}


module.exports = generateArchiveOfPage