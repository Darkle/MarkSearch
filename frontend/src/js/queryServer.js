'use strict'

import { csrfToken } from './searchPage'
import { updateResults } from './resultsObject'
import { chunkResults } from './chunkResults'

import got from 'got'
import Promise from 'bluebird'

/****
 * Exports
 */
function queryServer(searchTerms, dateFilter) {
  var postUrl = `/frontendapi/getall/`
  if(searchTerms){
    postUrl =`/frontendapi/search/${ searchTerms }`
  }
  /****
   * jQuery doesn't use proper Promises (<3.0), so using "got" for ajax.
   *
   * Converting got to bluebird promise so I can bind stuff in queryServerAndRender.
   *
   * Using Promise.try to convert rather than Promise.resolve to guard against exceptions.
   * note: Promise.try(got.post()) doesn't seem to work, so return got.post() inside a 
   * function in the .try().
   */
  return Promise
          .try(() =>
            got.post(
              postUrl,
              {
                headers: {
                  'X-CSRF-Token': csrfToken
                },
                body: dateFilter
              }
            )
          )
          .then( response => {
            var rows = JSON.parse(response.body)
            /****
             * chunkResults returns an empty object if responseData.rows is empty
             */
            updateResults(chunkResults(rows))
            return rows
          })
}

export { queryServer }