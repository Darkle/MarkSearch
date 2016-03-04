'use strict';

import { searchInput$ } from './searchPage'
import { dateFilterIsSet, getDateFilterParameters } from './dateFilter'

/****
 * for some reason import * as stringUtils from 'string' isn't
 * working, so using require
 */
var stringUtils = require('string')

function getSearchTextAndDateFilterParams(){
  /****
   * Get the search box text (if there is any) and the date filter parameters (if there are any).
   */
  var searchTerms = null
  var dateFilter = null
  /****
   * stringUtils collapseWhitespace will trim the text and also get get rid of any
   * excess (>1) whitespace in between words.
   */
  var searchInputValue = stringUtils(searchInput$.val()).collapseWhitespace().s
  var unencodedSearchTerms

  if(searchInputValue.length){
    searchTerms = encodeURIComponent(searchInputValue)
    /****
     * We use unencodedSearchTerms in renderResults for the snippet highlight regex
     */
    unencodedSearchTerms = searchInputValue
  }
  /****
   * If they were searching when they have the date filter displayed
   * and either the date filter 'From To' is set or the shortcuts
   * is set, then filter the results by date
   */
  if(dateFilterIsSet()){
    dateFilter = getDateFilterParameters()
  }
  return {searchTerms, dateFilter, unencodedSearchTerms}
}

export { getSearchTextAndDateFilterParams }