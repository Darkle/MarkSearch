'use strict';

import { resultsObject } from './resultsObject'
import { queryServer } from './queryServer'
import { renderResults } from './renderResults'
import { removeResults } from './removeResults'
import { getSearchTextAndDateFilterParams } from './getSearchTextAndDateFilterParams'
import { updateResultsCountDiv } from './updateResultsCountDiv'

function queryServerAndRender(){
  removeResults()
  var {searchTerms, dateFilter} = getSearchTextAndDateFilterParams()
  return queryServer(searchTerms, dateFilter)
      .then(rows => {
        var rowsLength = rows.length
        console.log(` rows.length ${rows.length}`)
        updateResultsCountDiv(rowsLength)
        /****
         * Check if there are any results
         */
        if(rowsLength){
          return renderResults(resultsObject.results.chunk_0, searchTerms)
        }
      })
      .catch(err => {console.error(err)})
}
/****
 * Exports
 */
export { queryServerAndRender }
