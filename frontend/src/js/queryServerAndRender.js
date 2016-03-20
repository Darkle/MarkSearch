'use strict';

import { resultsObject } from './resultsObject'
import { queryServer } from './queryServer'
import { renderResults } from './renderResults'
import { removeResults } from './removeResults'
import { getSearchTextAndDateFilterParams } from './getSearchTextAndDateFilterParams'
import { updateResultsCountDiv } from './updateResultsCountDiv'

function queryServerAndRender(){
  removeResults()
  var {searchTerms, dateFilter, unencodedSearchTerms} = getSearchTextAndDateFilterParams()
  return queryServer(searchTerms, dateFilter)
          /****
           * Bind unencodedSearchTerms in case queryServerAndRender gets called
           * again before queryServer finishes.
           */
          .bind({unencodedSearchTerms})
          .then(function(rows){
            var rowsLength = rows.length
            updateResultsCountDiv(rowsLength)
            /****
             * Check if there are any results
             */
            if(rowsLength){
              return renderResults(resultsObject.results.chunk_0, this.unencodedSearchTerms)
            }
          })
          .catch(err => {
            console.error(err)
            var parsedresponseBody
            try {
              parsedresponseBody = JSON.parse(err.response.body)
            }
            catch(e){}
            updateResultsCountDiv(parsedresponseBody)
          })
}
/****
 * Exports
 */
export { queryServerAndRender }
