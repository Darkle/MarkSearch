'use strict';

import { resultsContainer$ } from './searchPage'
import { showSafeBrowsingDetails, deletePageFromMarksearch } from './resultsEventHandlers'
import { generateSearchClipAndHighlight } from './generateSearchClipAndHighlight'
import { updateChunkShownValue } from './resultsObject'
var STOPWORDS = require('../../../appmodules/server/lunrStopwordFilter.json')

import _ from 'lodash'
import DOMPurify from 'dompurify'
import moment from 'moment'
import stem from 'stem-porter'

/****
 * Exports
 */

function renderResults(resultsChunk, searchTerms){
  return new Promise((resolve, reject) =>{
    try{
      updateChunkShownValue(resultsChunk.chunkIndex, true)
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
      _.each(resultsChunk.resultRows, row => {
        resultID++
        /****
         * prebrowsing for the first 2 results (if set in settings).
         * Preconnect for the first and dns-prefetch for the second.
         * These are removed when results are removed in removeResults.js
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
            link.setAttribute('href', row.pageUrl)
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
        mainResultA.setAttribute('href', row.pageUrl)
        /*****
         * If there's no pageTitle text, then just use the page url
         */
        var pageTitle = ''
        if(row.pageTitle){
          pageTitle = _.trim(row.pageTitle)
        }
        mainResultA.textContent = (pageTitle.length > 0) ? pageTitle : row.pageUrl
        mainResultLink.appendChild(mainResultA)

        var resultUrlText = document.createElement('div')
        resultUrlText.className = 'resultUrlText'
        resultUrlText.textContent = row.pageUrl
        mainDetails.appendChild(resultUrlText)

        //var resultDateCreated = document.createElement('div')
        //resultDateCreated.textContent = moment(row.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a")
        //mainDetails.appendChild(resultDateCreated)

        /*****
         * SafeBrowsing
         */
        if(row.safeBrowsing){
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

          var safeBrowsingObj = JSON.parse(row.safeBrowsing)

          _.each(safeBrowsingObj.details, (sbDetails, sbType) => {

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
            safeBrowsingExplination.innerHTML = DOMPurify.sanitize(sbDetails.explanation)
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

        if(row.snippet){
          /****
           * The snippet is set to -1 (in server side search.js) which means it chooses
           * the column automatically and it usually picks a pageText snippet, however
           * the bm25 is set to boost the pageTitle & pageDescription, so if those are
           * selected, then the pageText snippet ends up having no highlighting applied
           * to the tokens (search terms), so gonna manually add them if not already there
           * in the snippet.
           */
          var highlightOpeningSpan = '<span class="searchHighlight">'
          if(row.snippet.indexOf(highlightOpeningSpan) < 0 ){
            searchTerms
              .toLowerCase()
              .split(' ')
              .filter( searchTerm =>
                searchTerm.length > 1 && !searchTerm.startsWith('site:') && !STOPWORDS[searchTerm]
              )
              .forEach( searchWord => {
                var stemmedSearchWord = stem(searchWord)
                var regex = new RegExp('(' + stemmedSearchWord + '[a-z]*)', 'gi')
                var replacement = highlightOpeningSpan + '$1' + '</span>'
                row.snippet = row.snippet.replace(regex, replacement)
              })
          }
          description.innerHTML = DOMPurify.sanitize(_.trim(row.snippet))
        }
        else if(row.pageDescription){
          description.textContent = _.trim(row.pageDescription)
        }
        mainDetails.appendChild(description)

        var metaIconsContainer = document.createElement('div')
        metaIconsContainer.className = 'metaIconsContainer'
        resultDiv.appendChild(metaIconsContainer)

        var metaIcons = document.createElement('div')
        metaIcons.className = 'metaIcons'
        metaIconsContainer.appendChild(metaIcons)

        var metaIconArchive
        if(row.archiveLink){
          metaIconArchive = document.createElement('a')
          metaIconArchive.setAttribute('href', row.archiveLink)
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
         * If Unsafe, give the user a visual reminder that they can
         * delete this page from MarkSearch
         */
        if(row.safeBrowsing){
          metaIconDelete.className = 'material-icons protip warning trashDelete'
        }
        else{
          metaIconDelete.className = 'material-icons protip trashDelete'
        }
        metaIconDelete.textContent = 'delete'
        metaIconDelete.addEventListener('click', deletePageFromMarksearch, false)
        metaIconDelete.setAttribute('data-pageUrl', row.pageUrl)
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