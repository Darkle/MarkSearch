'use strict';

import { resultsContainer$ } from './searchPage'
import { showSafeBrowsingDetails, deletePageFromMarksearch } from './resultsEventHandlers'
import { generateSearchClipAndHighlight } from './generateSearchClipAndHighlight'

import _ from 'lodash'
import xss as xssSanitize from 'xss'
//import moment from 'moment'

/****
 * Exports
 */

function renderResults(resultsChunk, searchTerms){
  return new Promise((resolve, reject) =>{
    try{
      resultsChunk.shownYet = true
      /****
       * 200 items in each chunk
       * id: `result_${resultID}` is for browser extension, so
       * they can link to a particular result in the MarkSearch results page
       * (Results are in chunks of 200)
       */
      var resultID = resultsChunk.chunkIndex * 200
      /****
       * Not using jQuery here so can more carefully manage the element references and event listener
       * functions myself to make sure we dont get memory leaks when removing the results elements and
       * event listener handlers - cause we do that a lot
       * (also i dont really like the way jQuery's .remove() works)
       * Nulling element references at the end as well just in case
       */
      var docFragment = document.createDocumentFragment()
      /****
       * If displaying the first result chunk, need to create the addRemoveDiv.
       * Using this div to make it easy to remove all results in one go, rather
       * than iterating over them all and removing them individually
       */
      let addRemoveDiv
      if(resultsChunk.chunkIndex === 0){
        addRemoveDiv = document.createElement('div')
        addRemoveDiv.setAttribute('id', 'addRemoveDiv')
        docFragment.appendChild(addRemoveDiv)
      }
      else{
        addRemoveDiv = document.getElementById('addRemoveDiv')
      }
      _.each(resultsChunk.resultRows, result => {
        var doc = result.doc
        /****
         * generate search result text clip with the search term words in
         * them and then add highlighting.
         */
        if(searchTerms){
          doc.searchHighlight = generateSearchClipAndHighlight(doc, searchTerms)
        }
        resultID++

        /****
         * prebrowsing for the first 2 results (if set in settings).
         * Preconnect for the first and dns-prefetch for the second
         */
        if(markSearchSettings.prebrowsing){
          if(resultID < 3){
            var rel
            if(resultID === 1){
              rel = 'preconnect'
            }
            else if(resultID === 2){
              rel = 'dns-prefetch'
            }
            var link = document.createElement('link')
            link.setAttribute('class', 'prebrowsing')
            link.setAttribute('href', doc._id)
            link.setAttribute('rel', rel)
            document.head.appendChild(link)
          }
        }

        var resultDiv = document.createElement('div')
        resultDiv.setAttribute('id', `result_${resultID}`)
        resultDiv.className = 'result'
        addRemoveDiv.appendChild(resultDiv)

        var mainDetails = document.createElement('div')
        mainDetails.className = 'mainDetails'
        resultDiv.appendChild(mainDetails)

        var mainResultLink = document.createElement('div')
        mainResultLink.className = 'mainResultLink'
        mainDetails.appendChild(mainResultLink)

        var mainResultA = document.createElement('a')
        mainResultA.setAttribute('href', doc._id)
        /*****
         * If there's no pageTitle text, then just use the page url
         */
        var pageTitle = ''
        if(doc.pageTitle){
          pageTitle = _.trim(doc.pageTitle)
        }
        mainResultA.textContent = (pageTitle.length > 0) ? pageTitle : doc._id
        mainResultLink.appendChild(mainResultA)

        var resultUrlText = document.createElement('div')
        resultUrlText.className = 'resultUrlText'
        resultUrlText.textContent = doc._id
        mainDetails.appendChild(resultUrlText)

        //var resultDateCreated = document.createElement('div')
        //resultDateCreated.textContent = moment(doc.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")
        //mainDetails.appendChild(resultDateCreated)
        if(result.score){
          var resultSearchScore = document.createElement('div')
          resultSearchScore.textContent = result.score
          mainDetails.appendChild(resultSearchScore)
        }

        /*****
         * SafeBrowsing
         */
        if(doc.safeBrowsing.possiblyUnsafe){
          mainResultLink.className += ' warning'
          mainResultA.className += ' warning'

          var mainResultLinkIconWarning = document.createElement('i')
          mainResultLinkIconWarning.className = 'material-icons'
          mainResultLinkIconWarning.textContent = 'announcement'
          mainResultLinkIconWarning.setAttribute('title', 'There May Be Safe Browsing Issues With This URL')
          mainResultLink.appendChild(mainResultLinkIconWarning)

          var safeBrowsing = document.createElement('div')
          safeBrowsing.className = 'safeBrowsing warning'
          mainDetails.appendChild(safeBrowsing)

          _.each(doc.safeBrowsing.details, (sbDetails, sbType) => {

            var safeBrowsingType = document.createElement('div')
            safeBrowsingType.className = sbType
            safeBrowsing.appendChild(safeBrowsingType)

            var safeBrowsingBriefDescription = document.createElement('div')
            safeBrowsingBriefDescription.className = 'safeBrowsingBriefDescription'
            safeBrowsingType.appendChild(safeBrowsingBriefDescription)

            var infoOutline = document.createElement('i')
            infoOutline.className = 'material-icons'
            infoOutline.textContent = 'info_outline'
            safeBrowsingBriefDescription.appendChild(infoOutline)

            var descrAdropdown = document.createElement('a')
            descrAdropdown.setAttribute('href', '#')
            descrAdropdown.className = 'safeBrowsingToggleLink'
            descrAdropdown.textContent = sbDetails.bold
            descrAdropdown.addEventListener('click', showSafeBrowsingDetails, false)
            safeBrowsingBriefDescription.appendChild(descrAdropdown)

            var descrAdropdownMatIcon = document.createElement('i')
            descrAdropdownMatIcon.className = 'material-icons'
            descrAdropdownMatIcon.textContent = 'expand_more'
            descrAdropdown.appendChild(descrAdropdownMatIcon)

            var safeBrowsingExplination = document.createElement('div')
            safeBrowsingExplination.className = 'safeBrowsingExplination'
            safeBrowsingExplination.innerHTML = xssSanitize(sbDetails.explanation, {whiteList: {a: ['href']}})
            safeBrowsingType.appendChild(safeBrowsingExplination)

            safeBrowsingType = null
            safeBrowsingBriefDescription = null
            infoOutline = null
            descrAdropdown = null
            descrAdropdownMatIcon = null
            safeBrowsingExplination = null
          })
          mainResultLinkIconWarning = null
          safeBrowsing = null
        }
        var description = document.createElement('p')
        description.className = 'description'
        if(doc.searchHighlight){
          description.innerHTML = xssSanitize(doc.searchHighlight, {whiteList: {span: ['class']}})
        }
        else if(doc.pageDescription){
          description.textContent = _.trim(doc.pageDescription)
        }
        mainDetails.appendChild(description)

        var metaIconsContainer = document.createElement('div')
        metaIconsContainer.className = 'metaIconsContainer'
        resultDiv.appendChild(metaIconsContainer)

        var metaIcons = document.createElement('div')
        metaIcons.className = 'metaIcons'
        metaIconsContainer.appendChild(metaIcons)

        var metaIconArchive
        if(doc.archiveLink){
          metaIconArchive = document.createElement('a')
          metaIconArchive.setAttribute('href', doc.archiveLink)
          metaIconArchive.setAttribute('title', 'Archive Link')
          metaIconArchive.setAttribute('data-pt-title', 'Archive Link')
          //metaIconArchive.setAttribute('data-pt-gravity', 'bottom 0 3')
          metaIconArchive.setAttribute('target', '_blank')
          metaIconArchive.className = 'material-icons protip'
          metaIconArchive.textContent = 'account_balance'
          metaIcons.appendChild(metaIconArchive)
        }

        var metaIconDelete = document.createElement('a')
        metaIconDelete.setAttribute('href', '#')
        metaIconDelete.setAttribute('title', 'Delete Bookmark From MarkSearch')
        metaIconDelete.setAttribute('data-pt-title', 'Delete Bookmark From MarkSearch')
        //metaIconDelete.setAttribute('data-pt-gravity', 'bottom 0 3')
        /****
         * If possiblyUnsafe, give the user a visual reminder that they can
         * delete this page from MarkSearch
         */
        if(doc.safeBrowsing.possiblyUnsafe){
          metaIconDelete.className = 'material-icons protip warning trashDelete'
        }
        else{
          metaIconDelete.className = 'material-icons protip trashDelete'
        }
        metaIconDelete.textContent = 'delete'
        metaIconDelete.addEventListener('click', deletePageFromMarksearch, false)
        metaIconDelete.setAttribute('data-pageUrl', doc._id)
        metaIcons.appendChild(metaIconDelete)

        resultDiv = null
        mainDetails = null
        mainResultLink = null
        mainResultA = null
        resultUrlText = null
        description = null
        metaIconsContainer = null
        metaIcons = null
        metaIconArchive = null
        metaIconDelete = null
      })
      resultsContainer$[0].appendChild(docFragment)
      docFragment = null
      addRemoveDiv = null
      resolve()
    }
    catch(error){
      reject(error)
    }
  })
}
/****
 * Exports
 */
export { renderResults }