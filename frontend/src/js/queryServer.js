'use strict'

import { csrfToken } from './searchPage'
import { updateResults } from './resultsObject'
import { chunkResults } from './chunkResults'

import axios from 'axios'
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
   * jQuery doesn't use proper Promises (<3.0), so using "axio" for ajax.
   *
   * Converting axio to bluebird promise so I can bind stuff in queryServerAndRender.
   *
   * Using Promise.try to convert rather than Promise.resolve to guard against exceptions.
   * note: Promise.try(axio.post()) doesn't seem to work, so return axio.post() inside a
   * function in the .try().
   */
  return Promise
          .try(() =>
            axios
            .post(
              postUrl,
              dateFilter,
              {
                headers: {
                  'X-CSRF-Token': csrfToken
                }
              }
            )
          )
          .then( response => {
            /****
             * chunkResults returns an empty object if data is empty
             */
            updateResults(chunkResults(response.data))
            return response.data
          })
}

export { queryServer }
