'use strict';

import { csrfToken, haveShownSomeResults, set_haveShownSomeResults } from './searchPage'
import { replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { updateResultsCountDiv } from './updateResultsCountDiv'

import _ from 'lodash'
import got from 'got'

/****
 * Exports
 */
function queryServer(searchTerms){
  var postUrl = `/indexPage_getall/`
  if(searchTerms){
    postUrl =`/indexPage_search/${searchingLoose}/${searchTerms}`
  }
  /****
   * jQuery doesn't use proper Promises (<3.0), so using "got" for ajax
   */
  return got.post(postUrl,
      {
        headers:
        {
          'X-CSRF-Token': csrfToken
        }
      })
      .then( response => {
        var responseData = JSON.parse(response.body)
        updateResultsCountDiv(responseData.total_rows)
        var responseRowsArray = []
        if(responseData.total_rows > 0){
          if(!haveShownSomeResults){
            window.localStorage.haveShownSomeResults = 'true'
            set_haveShownSomeResults(true)
          }
          responseRowsArray = responseData.rows
        }
        /****
         * chunkResults returns an empty object if responseData.rows is empty
         */
        replaceResults(responseRowsArray, chunkResults(responseData.rows))
      })
}
/****
 * Exports
 */
export { queryServer }