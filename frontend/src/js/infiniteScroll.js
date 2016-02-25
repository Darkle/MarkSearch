'use strict';

import { renderResults } from './renderResults'
import { scrollHeightCheck } from './scrollHeightCheck'
import { resultsObject } from './resultsObject'

import _ from 'lodash'

var padding = 1000
var delayTime = 300
//var eventNum = 0
var timeout

/****
 * Exports
 */
function initInfiniteScroll(event){
  /****
   * A simple debounce
   */
  if(timeout){
    clearTimeout(timeout)
  }
  timeout = setTimeout( ev => {
    clearTimeout(timeout)
    //eventNum++
    //console.log(`debounce event ${eventNum}`, event)
    if(scrollHeightCheck(window, document, padding)){
      /****
       * Only run if we find a chunk of results that hasn't been shown yet
       */
      var nextResults = _.find(resultsObject.results, 'shownYet', false)
      if(nextResults){
        renderResults(nextResults)
      }
    }
  }, delayTime)
}
/****
 * Exports
 */
export { initInfiniteScroll }