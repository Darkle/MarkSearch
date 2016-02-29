'use strict';

import { csrfToken } from './searchPage'
import { queryServerAndRender } from './queryServerAndRender'

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
    /****
     * If the link displayed also has safebrowsing details (which have a dropdown with an
     * event attached), then remove those events before removing the container element.
     */
    var safeBrowsingToggles = resultDiv[0].querySelectorAll('.safeBrowsingToggleLink')
    if(safeBrowsingToggles.length){
      _.each(safeBrowsingToggles, elem => {
        elem.removeEventListener('click', showSafeBrowsingDetails)
      })
    }
    resultDiv.animate({height: "toggle"}, 400, () => {
      resultDiv.remove()
      got.delete(`/frontendapi/remove/${pageUrl}`,
          {
            headers:
            {
              'X-CSRF-Token': csrfToken
            }
          })
          /****
           * dont simplify this to .then(queryServerAndRender) as that
           * will send through the response as searchTerms.
           */
          .then( response => queryServerAndRender())
          .catch(err => console.error(err))
    })
  })
}
/****
 * Exports
 */
export { showSafeBrowsingDetails, deletePageFromMarksearch }