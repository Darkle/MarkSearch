'use strict';

import { csrfToken, resultsCountDiv$ } from './searchPage'
import { replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'

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
        resultsCountDiv$
            .text(`${responseData.total_rows} Results`)
            .data('data-resultsCount', responseData.total_rows)
            .removeClass('hide')

        var chunkedResultsObject
        var responseRowsArray = []
        if(responseData.total_rows > 0){
          window.localStorage.haveResults = 'true'
          chunkedResultsObject = chunkResults(responseData.rows)
          responseRowsArray = responseData.rows
        }
        //var a = responseRowsArray
        //debugger
        replaceResults(responseRowsArray, chunkedResultsObject)
      })
}
/****
 * Exports
 */
export { queryServer }