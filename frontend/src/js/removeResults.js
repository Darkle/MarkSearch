'use strict'

import { resultsContainer$, resultsCountDiv$ } from './searchPage'
import { showSafeBrowsingDetails, deletePageFromMarksearch } from './resultsEventHandlers'

import _ from 'lodash'

function removeResults() {
  /****
   * Remove the event listeners from the results elements before we remove
   * the elements themselves so we dont have any memory leaks.
   */
  var safeBrowsingToggleLinks = document.querySelectorAll('.safeBrowsingToggleLink')
  _.each(safeBrowsingToggleLinks, elem => {
    elem.removeEventListener('click', showSafeBrowsingDetails)
  })
  var trashDeleteLinks = document.querySelectorAll('.trashDelete')
  _.each(trashDeleteLinks, elem => {
    elem.removeEventListener('click', deletePageFromMarksearch)
  })
  let addRemoveDiv = document.getElementById('addRemoveDiv')
  if(addRemoveDiv){
    resultsContainer$[0].removeChild(addRemoveDiv)
  }
  /****
   * Also remove any prebrowsing links we made in the head
   */
  var head = document.head
  var preBrowsingLinks = head.querySelectorAll('.prebrowsing')
  _.each(preBrowsingLinks, elem => {
    head.removeChild(elem)
  })
  /****
   * Hide results count in case the response from the server takes a while
   * - if there were 0 results last time, the user may think there are 0 results
   * this time too because the 0 from last time is still showing, so hide it.
   */
  resultsCountDiv$.addClass('visibilityHidden')
  /****
   * The scrollTop(0) is for ios7 safari - if using the date filter, sometimes the
   * results are obscured at the top by the date filter box (almost as if the browser scrolls
   * down a bit). Setting it to scrollTop(0) makes sure that the top results are visable.
   */
  $(window).scrollTop(0)
}
/****
 * Exports
 */
export { removeResults }