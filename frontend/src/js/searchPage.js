'use strict';

import "babel-polyfill"

import { initInfiniteScroll } from './infiniteScroll'
import { checkIfiOS7 } from './checkIfiOS7'
import { queryServerAndRender } from './queryServerAndRender'
import { addUrlsInit } from './addUrls'
import { checkIfTouchDevice } from './checkIfTouchDevice'
import { initSearchPlaceholder } from './initSearchPlaceholder'
import { tooltips } from './tooltips'
import { dateFilterInit } from './dateFilter'

import _ from 'lodash'

var csrfToken
var resultsCountDiv$
var resultsContainer$
var searchInput$

$(document).ready(searchPageInit)

function searchPageInit(event){
  searchInput$ = $('#searchInput')
  csrfToken = $('#csrfInput').val()
  resultsCountDiv$ = $('#resultsCount')
  resultsContainer$ = $('#resultsContainer')
  var isIOS7 = checkIfiOS7(window)
  var body$ = $('body')
  if(!checkIfTouchDevice(window)){
    searchInput$.focus()
  }
  initSearchPlaceholder(searchInput$)

  /****
   * Initializing dateFilter here as queryServerAndRender() relies on some stuff in
   * the dateFilter module. Should be ok initializing up here as it does not import
   * anything from searchPage.js
   */
  dateFilterInit()

  /****
   * Display all bookmarks stored in MarkSearch on page load
   */
  queryServerAndRender()
      .then(() => {
        tooltips()
        /****
         * Adding touchmove too cause of this: http://bit.ly/21GgA7M
         */
        $(window).on('scroll touchmove', initInfiniteScroll)
      })
      .then(() => {
        //TODO - need to fix this with the hash stuff
        /****
         * For when the user has loaded the MarkSearch search page
         * via clicking on the results "more" link/button in the
         * browser extension, we want the browser to go to the next set
         * (chunk) of results by using the hash fragment identifier. The results
         * aren't there on page load so we miss the browsers opportunity
         * to scroll to the element with the fragment id, so we have to
         * force the browser to do it again after the results are loaded in
         * the DOM
         * Need to change the result number slightly becuase the browser doesnt
         * take into account the nav/header on the MarkSearch search page which
         * is posistion:fixed and obscures the results at the top of the window,
         * so scroll to the previous result
         */
        var urlHash = window.location.hash
        if(urlHash.indexOf('#result_') > -1){
          var resultNumberLookingFor = Number(urlHash.split('#result_')[1])
          if(!_.isNaN(resultNumberLookingFor) && resultNumberLookingFor > 1){
            resultNumberLookingFor--
            window.location.hash = `#result_${resultNumberLookingFor}`
          }
        }
      })
      .catch(err => {console.error(err)})
  /****
   * Search
   */
  var searchForm$ = $('#searchForm')
  var inputOldValue = searchInput$.val().toLowerCase()
  /****
   * To get rid of the keyboard on submit on mobile/tablet.
   * So we're not actually querying server for results on submit, as the
   * "propertychange change click keyup input paste" event listeners below
   * will grab the lastchange before submit/enter is pressed and get the
   * results anyway
   * For some reason searchForm$.on with lodash debounce doesn't detect
   * submit event, so doing it here on its own - could be something to do
   * with _.debounce only returning a debounced function and not actually
   * executing the function itself - http://stackoverflow.com/a/24309963/3458681
   */
  searchForm$.on('submit', event => {
    event.preventDefault()
    searchInput$.blur()
  })
  /****
   * Increase the debounce a bit if on iOS7 as it stutters a bit
   */
  var debounceTime = isIOS7 ? 800 : 300
  /****
   * Extra events cause of <IE10
   */
  searchForm$.on(
      "propertychange change click keyup input paste",
      _.debounce(
          () => {
            var searchInputValue = _.trim(searchInput$.val()).toLowerCase()
            if(searchInputValue !== inputOldValue){
              inputOldValue = searchInputValue
              queryServerAndRender()
            }
          },
          debounceTime,
          {
            'leading': false,
            'trailing': true
          }
      )
  )
  /****
   * Fix for iOS 7 and below (e.g iPhone 4) for input focus jump for position:fixed
   * elements: http://bit.ly/1m9hvNI
   * Doing a scrollTop(0) too as it's easier than messing around with the position & top:xpx
   * for header nav.
   * Using touchstart event as it seems to fire before input focus event and gives us a
   * little bit more time to do stuff before the input focus jump.
   */
  if(isIOS7){
    console.info("we may be on an iPhone 4")
    var navHeader$ = $('.navHeader')
    navHeader$.on('touchstart', event => {
      body$.scrollTop(0)
    })
  }
  /****
   * Nav bar buttons & subbar event listeners
   */
  /****
   * Doing hover this way cause of this: http://stackoverflow.com/questions/17233804/
   */
  $('#dateFilterButton, #addPageButton, #settingsButton').hover(
      (event) => {
        $(event.currentTarget.firstElementChild).addClass('navBar-materialIcon-hover')
      },
      (event) => {
        $(event.currentTarget.firstElementChild).removeClass('navBar-materialIcon-hover')
      }
  ).on('touchend',
      (event) => {
        $(event.currentTarget.firstElementChild).removeClass('navBar-materialIcon-hover')
      }
  )

  addUrlsInit()
  //settingsSubbarInit()
}
/****
 * Exports
 */
export {
    csrfToken,
    resultsCountDiv$,
    resultsContainer$,
    searchInput$
}