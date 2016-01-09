'use strict';

import { csrfToken } from './searchPage'
import { resultsObject, replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { updateResultsCountDiv } from './updateResultsCountDiv'

import got from 'got'
import _ from 'lodash'
import notie from 'notie'

/****
 * Exporting and showSafeBrowsingDetails & deletePageFromMarksearch so
 * that its easy to remove them (being the event listener functions) when remove old results in
 * removeResults.js module
 */
function showSafeBrowsingDetails(event){
  event.preventDefault()
  $(event.currentTarget).parent().next().toggleClass('showBlock')
}

function deletePageFromMarksearch(event){
  event.preventDefault()
  var deleteButton = $(event.currentTarget)
  var pageUrl = encodeURIComponent(deleteButton.data("pageurl"))
  /******
   * notie.confirm - Show a confirmation notification to confirn deletion
   */
  notie.confirm('Delete Bookmark From MarkSearch?', 'Yes', 'Cancel', function() {
    deleteButton[0].removeEventListener('click', deletePageFromMarksearch)
    var resultDiv = deleteButton.parent().parent().parent()
    var safeBrowsingToggle = resultDiv[0].querySelector('.safeBrowsingToggleLink')
    if(safeBrowsingToggle){
      safeBrowsingToggle.removeEventListener('click', showSafeBrowsingDetails)
    }
    resultDiv.animate({height: "toggle"}, 500, () => resultDiv.remove())
    got.delete(`/indexPage_remove/${pageUrl}`,
        {
          headers:
          {
            'X-CSRF-Token': csrfToken
          }
        })
        .then( response => {
          var fullResultsCacheArrayCopy = resultsObject.fullResultsCacheArray.slice()
          var jsonResponse
          try{
            jsonResponse = JSON.parse(response.body)
          }
          catch(e){
            throw Error(e)
          }
          _.remove(fullResultsCacheArrayCopy, document => document.id === jsonResponse.pageDeleted)
          var chunkedResultsObject = chunkResults(fullResultsCacheArrayCopy)
          updateResultsCountDiv(fullResultsCacheArrayCopy.length)
          replaceResults(fullResultsCacheArrayCopy, chunkedResultsObject)
        })
        .catch(err => console.error(err))
  })
}
/****
 * Exports
 */
export { showSafeBrowsingDetails, deletePageFromMarksearch }