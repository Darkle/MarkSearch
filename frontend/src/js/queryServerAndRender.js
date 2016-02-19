'use strict';

import { resultsObject } from './resultsObject'
import { queryServer } from './queryServer'
import { renderResults } from './renderResults'

import _ from 'lodash'
require('lodash-migrate')

function queryServerAndRender(searchTerms){
  return queryServer(searchTerms)
      .then(() => {
        /****
         * Check if there are any results
         */
        if(resultsObject.currentResults.chunk_0){
          return renderResults(resultsObject.currentResults.chunk_0, searchTerms)
        }
      })
}
/****
 * Exports
 */
export { queryServerAndRender }