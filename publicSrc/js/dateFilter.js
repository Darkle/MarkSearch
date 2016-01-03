'use strict';

import { removeResults } from './removeResults'
import { resultsObject, replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { renderResults } from './renderResults'

import velocity from 'velocity-animate'
import moment from 'moment'
import _ from 'lodash'

var resultsCountDiv$
var dateFilterContainer$
var dateFilterMaterialIcon$
var fromContainer$
var toContainer$
var nsSelectShortcuts$
var nsSelectFromMonth$
var nsSelectFromYear$
var nsSelectToMonth$
var nsSelectToYear$
var nsFromMonthCurrentText$
var nsToMonthCurrentText$
var nsFromYearCurrentText$
var nsToYearCurrentText$
var nsShortcutsCurrentText$
var shortCutValues = {
  "Past 3 days": {
    dateStart: () => moment().subtract(3, 'days'),
    dateEnd: () => moment()
  },
  "Past Week": {
    dateStart: () => moment().subtract(1, 'weeks'),
    dateEnd: () => moment()
  },
  "Past Month": {
    dateStart: () => moment().subtract(1, 'months'),
    dateEnd: () => moment()
  },
  "Past 3 Months": {
    dateStart: () => moment().subtract(3, 'months'),
    dateEnd: () => moment()
  },
  "Past 6 Months": {
    dateStart: () => moment().subtract(6, 'months'),
    dateEnd: () => moment()
  },
  "Past Year": {
    dateStart: () => moment().subtract(1, 'years'),
    dateEnd: () => moment()
  }
}

function hideShowDateFilterSubbar(){
  var dataIsShown = dateFilterContainer$.data('isShown')
  if(dataIsShown === 'true'){
    dateFilterContainer$.data('isShown', 'false')
    $.Velocity(dateFilterContainer$[0], "slideUp", { duration: 500, display: 'none' })
        .then(elements => {
          dateFilterMaterialIcon$.removeClass('navBar-materialIcon-selected')
        })
  }
  else{
    dateFilterContainer$.data('isShown', 'true')
    dateFilterMaterialIcon$.addClass('navBar-materialIcon-selected')
    $.Velocity(dateFilterContainer$[0], "slideDown", { duration: 500, display: 'flex' })
  }
}

function resetFromTo(){
  nsFromMonthCurrentText$.text('Month')
  nsToMonthCurrentText$.text('Month')
  nsFromYearCurrentText$.text('Year')
  nsToYearCurrentText$.text('Year')
  fromContainer$.addClass('lightBlue')
  toContainer$.addClass('lightBlue')
}

function filterResults(usingShortcut){
  removeResults()
  var dateStartInMilliseconds
  var dateEndInMilliseconds
  if(usingShortcut){
    var selectedShortcut$ = $('.selected', nsSelectShortcuts$)
    var shortObjVal = shortCutValues[selectedShortcut$.data('value')]
    dateStartInMilliseconds = shortObjVal.dateStart().valueOf()
    dateEndInMilliseconds = shortObjVal.dateEnd().valueOf()

    //console.log(JSON.stringify(tempResults))
    //debugger
  }
  else{
    var selectedFromMonth$ = $('.selected', nsSelectFromMonth$)
    var selectedFromYear$ = $('.selected', nsSelectFromYear$)
    var selectedToMonth$ = $('.selected', nsSelectToMonth$)
    var selectedToYear$ = $('.selected', nsSelectToYear$)



  }
  var fullResultsCacheArrayCopy = resultsObject.fullResultsCacheArray.slice()
  var dateFilteredResults = _.filter(fullResultsCacheArrayCopy, arrayItem => {
    return (arrayItem.doc.dateCreated >= dateStartInMilliseconds || arrayItem.doc.dateCreated <= dateEndInMilliseconds)
  })
  debugger
  resultsCountDiv$
      .text(`${dateFilteredResults.length} Results`)
      .data('data-resultsCount', dateFilteredResults.length)
      .removeClass('hide')
  replaceResults(null, chunkResults(dateFilteredResults))
  if(dateFilteredResults.length > 0){
    renderResults(resultsObject.currentResults.chunk_0, null)
  }
}

function dateFilter(){
  var subBar$ = $('.subBar')
  var shortCutsContainer$ = $('.shortcutsContainer')
  var dateFilterNavButtonContainer$ = $('.dateFilter')
  var dateFilterButton$ = $('a', dateFilterNavButtonContainer$)
  var otherNavMaterialIcons$ = $('.addPage .material-icons, .settings-etal .material-icons')
  dateFilterContainer$ = $('.dateFilterSettings')
  dateFilterMaterialIcon$ = $('.material-icons', dateFilterButton$)
  fromContainer$ = $('.fromContainer')
  toContainer$ = $('.toContainer')
  resultsCountDiv$ = $('#resultsCount')
  
  var currentYear = moment().year()
  /****
   * 2016 - year MarkSearch was released, so don't need any earlier
   */
  var msReleaseDate = 2010
  var numYearsToInclude = (currentYear - msReleaseDate) + 1

  _.times(numYearsToInclude, num => {
    var year = (num + 1) + msReleaseDate
    $('<option>',
        {
          text: year,
          value: year
        }
    ).appendTo('.selectFromYear, .selectToYear')
  })

  $('select').niceSelect()
  nsSelectFromMonth$ = $('.nice-select.selectFromMonth')
  nsSelectFromYear$ = $('.nice-select.selectFromYear')
  nsSelectToMonth$ = $('.nice-select.selectToMonth')
  nsSelectToYear$ = $('.nice-select.selectToYear')
  nsSelectShortcuts$ = $('.nice-select.shortcuts')
  nsFromMonthCurrentText$ = $('.current', nsSelectFromMonth$)
  nsFromYearCurrentText$ = $('.current', nsSelectFromYear$)
  nsToMonthCurrentText$ = $('.current', nsSelectToMonth$)
  nsToYearCurrentText$ = $('.current', nsSelectToYear$)
  nsShortcutsCurrentText$ = $('.current', nsSelectShortcuts$)

  resetFromTo()
  nsShortcutsCurrentText$.text('Shortcuts')

  $('.nice-select.shortcuts .list').click(event => {
    resetFromTo()
    shortCutsContainer$.removeClass('lightBlue')
    filterResults(true)
  })

  $('.nice-select.selectFromYear .list').click(event => {
    fromContainer$.removeClass('lightBlue')
    if(nsFromMonthCurrentText$.text() === 'Month'){
      nsFromMonthCurrentText$.text('January')
    }
    /****
     * check if To is set and if so, filter results
     */
    if(nsToYearCurrentText$.text() !== 'Year'){
      shortCutsContainer$.addClass('lightBlue')
      nsShortcutsCurrentText$.text('Shortcuts')
      console.log('ready to filter: selectFromYear')
      filterResults()
    }
  })

  $('.nice-select.selectToYear .list').click(event => {
    toContainer$.removeClass('lightBlue')
    if(nsToMonthCurrentText$.text() === 'Month'){
      nsToMonthCurrentText$.text('January')
    }
    /****
     * check if From is set and if so, filter results
     */
    if(nsFromYearCurrentText$.text() !== 'Year'){
      shortCutsContainer$.addClass('lightBlue')
      nsShortcutsCurrentText$.text('Shortcuts')
      console.log('ready to filter: selectToYear')
      filterResults()
    }
  })

  dateFilterButton$.click(event =>{
    event.preventDefault()
    var currentlyShownSubBar$ = subBar$.children()
        .filter( (index, elem) => $(elem).data('isShown') === 'true')
    /****
     * If there is a subBar being shown and it is not the dateFilterContainer$, then
     * hide it and show the dateFilterContainer$
     */
    if(currentlyShownSubBar$[0] && currentlyShownSubBar$[0] !== dateFilterContainer$[0]){
      dateFilterMaterialIcon$.addClass('navBar-materialIcon-selected')
      $.Velocity(currentlyShownSubBar$[0], "slideUp", { duration: 500, display: 'none' })
          .then(elems => {
            currentlyShownSubBar$.data('isShown','false')
            otherNavMaterialIcons$.removeClass('navBar-materialIcon-selected')
            hideShowDateFilterSubbar()
          })
    }
    /****
     * Else show/hide the DateFilter subbar
     */
    else {
      hideShowDateFilterSubbar()
    }
  })
}

/****
 * Exports
 */
export { dateFilter }