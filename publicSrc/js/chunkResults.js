'use strict';

import _ from 'lodash'

function chunkResults(rawResults){
  /****
   * Chunk the results in groups of 200 for when there are 5000+ results, as rendering all that
   * to the DOM in one go might cause the browser to stutter. Also, helps with the highlights/results clip
   * as doing that regex search and text replace on anything more than 200 results might slow down
   * displaying the results.
   */
  var chunkAndShownData = {}
  if(rawResults && rawResults.length){
    var chunkedResults = _.chunk(rawResults, 200)
    _.each(chunkedResults, (resultChunk, index) => {
      chunkAndShownData[`chunk_${index}`] = {
        chunkIndex: index,
        shownYet: false,
        resultRows: resultChunk
      }
    })
  }
  return chunkAndShownData
}

export { chunkResults }