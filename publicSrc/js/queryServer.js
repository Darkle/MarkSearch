'use strict';

import { csrfToken } from './searchPage'
import { replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { updateResultsCountDiv } from './updateResultsCountDiv'

import _ from 'lodash'
import got from 'got'

/****
 * Exports
 */
var queryServer = (searchTerms) => {
  var postUrl = `/indexPage_getall/`
  if(searchTerms){
    postUrl =`/indexPage_search/${window.localStorage.searchLoose}/${searchTerms}`
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
          window.localStorage.haveResults = 'true'
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