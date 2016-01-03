'use strict';

/****
 * We cache the results for when the user is using the date filter.
 * If the user changes the dates and we didn't have the cache, we would have
 * to do another get request to get all the pages in marksearch again. It also
 * helps prevent needing another get request if the user cancels a search (e.g.
 * when user clicks out of the search box or deletes all the characters in the
 * search box) and we want to show all the pages in marksearch again
 */
var resultsObject = {
  fullResultsCacheArray: null,
  currentResults: null
}
var replaceResults = (fullResultsCacheArray, currrentResults) => {
  if(fullResultsCacheArray){
    resultsObject.fullResultsCacheArray = fullResultsCacheArray
  }
  if(currrentResults){
    resultsObject.currentResults = currrentResults
  }
}
/****
 * Exports
 */
export { resultsObject, replaceResults }