'use strict';

import { queryServerAndRender } from './queryServerAndRender'
import { removeResults } from './removeResults'
import { searchErrorHandler } from './searchErrorsHandler'
import { searchingLoose, set_searchingLoose } from './searchPage'

var stringUtils = require('string')

var goose = () => {
  var looseSearchButton$ = $("#looseSearchButton")
  var looseSearchIcon$ = $("#looseSearchIcon")
  var searchInput$ = $('#searchInput')
  /****
   * On page load set the goose button title and set it to dark version if
   * loose search is the default
   */
  if(searchingLoose === 'true'){
    looseSearchButton$.attr('title', 'Loose Search Currently On')
    looseSearchIcon$[0].style.backgroundImage = 'url("/images/goosehover.svg")'
  }
  else{
    looseSearchButton$.attr('title', 'Loose Search Currently Off')
  }
  /****
   * If they click on the goose button, we want to change the search
   * to loose/not loose and then re-run the search if there is any
   * text in the search box
   */
  looseSearchButton$.click(event =>{
    event.preventDefault()
    if(searchingLoose === 'true'){
      window.localStorage.searchLoose = 'false'
      set_searchingLoose('false')
      looseSearchIcon$[0].style.backgroundImage = 'url("/images/goose.svg")'
      looseSearchButton$.attr('title', 'Loose Search Currently Off')
    }
    else{
      window.localStorage.searchLoose = 'true'
      set_searchingLoose('true')
      looseSearchIcon$[0].style.backgroundImage = 'url("/images/goosehover.svg")'
      looseSearchButton$.attr('title', 'Loose Search Currently On')
    }
    let searchInputValue = searchInput$.val()
    if(searchInputValue.trim().length > 0){
      removeResults()
      queryServerAndRender(encodeURIComponent(stringUtils(searchInputValue).collapseWhitespace().s))
          .catch(searchErrorHandler)
    }
  })
  /****
   * If user previously clicked to select loose search, then clicked to deselect loose search,
   * need to remove the js style
   */
  looseSearchButton$.mouseleave(event =>{
    if(window.localStorage.searchLoose !== 'true'){
      looseSearchIcon$[0].style.backgroundImage = ''
    }
  })
}
/****
 * Exports
 */
export { goose }