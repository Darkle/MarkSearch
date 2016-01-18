'use strict';

var request = require('request')
var debug = require('debug')('MarkSearch:archive.is')

function generateArchiveOfPage(doc){
  debug('generateArchiveOfPage running')
  return new Promise((resolve, reject) =>{
    request.post({
          url: 'https://archive.is/submit/',
          form: {url: doc._id}
        },
        (err, httpResponse, body) =>{
          if(err || !httpResponse.headers || !httpResponse.headers.location){
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
            debug('httpResponse:', httpResponse.headers)
            debug('archive.is backup successfull ', body)
            doc.archiveLink = httpResponse.headers.location
          }
          resolve(doc)
        }
    )
  })
}


module.exports = generateArchiveOfPage