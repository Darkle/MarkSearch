'use strict'

var resultsObject = {
  results: null
}

function updateResults(newResults) {
  resultsObject.results = newResults
}

function updateChunkShownValue(chunkIndex, shownYetVal) {
  resultsObject.results[`chunk_${ chunkIndex }`].shownYet = shownYetVal
}

/****
 * Exports
 */
export { resultsObject, updateResults, updateChunkShownValue }