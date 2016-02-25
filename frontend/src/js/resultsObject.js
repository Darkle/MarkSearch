'use strict';

var resultsObject = {
  results: null
}

function updateResults(newResults){
  resultsObject.results = newResults
}
/****
 * Exports
 */
export { resultsObject, updateResults }