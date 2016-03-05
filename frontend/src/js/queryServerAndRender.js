'use strict';

import { resultsObject } from './resultsObject'
import { queryServer } from './queryServer'
import { renderResults } from './renderResults'
import { removeResults } from './removeResults'
import { getSearchTextAndDateFilterParams } from './getSearchTextAndDateFilterParams'
import { updateResultsCountDiv } from './updateResultsCountDiv'
import { setSearchBoxAndOpenDateFilter } from './setSearchBoxAndOpenDateFilter'

import _ from 'lodash'

function queryServerAndRender(locationHashData){
  removeResults()

  var searchTerms
  var dateFilter
  var unencodedSearchTerms
  var resultId

  if(locationHashData){
    searchTerms = _.get(locationHashData, 'searchTerms', null)
    dateFilter = _.get(locationHashData, 'dateFilter', null)
    unencodedSearchTerms = _.get(locationHashData, 'unencodedSearchTerms', null)
    resultId = _.get(locationHashData, 'resultId', null)
    setSearchBoxAndOpenDateFilter(dateFilter, unencodedSearchTerms)
  }
  else{
    var searchTextAndDateFilterParams = getSearchTextAndDateFilterParams()
    searchTerms = _.get(searchTextAndDateFilterParams, 'searchTerms', null)
    dateFilter = _.get(searchTextAndDateFilterParams, 'dateFilter', null)
    unencodedSearchTerms = _.get(searchTextAndDateFilterParams, 'unencodedSearchTerms', null)
  }

  return queryServer(searchTerms, dateFilter)
          /****
           * Bind unencodedSearchTerms & resultId in case queryServerAndRender gets called
           * again before queryServer finishes.
           */
          .bind({unencodedSearchTerms, resultId})
          .then(function(rows){
            var rowsLength = rows.length
            updateResultsCountDiv(rowsLength)
            /****
             * Check if there are any results
             */
            if(rowsLength){
              return renderResults(resultsObject.results.chunk_0, this.unencodedSearchTerms)
            }
            return this.resultId
          })
          .catch(err => {
            var parsedresponseBody
            try {
              parsedresponseBody = JSON.parse(err.response.body)
            }
            catch(e){}
            updateResultsCountDiv(parsedresponseBody)
            console.error(err)
          })
}
/****
 * Exports
 */
export { queryServerAndRender }
