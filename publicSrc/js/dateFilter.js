'use strict';

import { removeResults } from './removeResults'
import { resultsObject, replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { renderResults } from './renderResults'
import { updateResultsCountDiv } from './updateResultsCountDiv'

import velocity from 'velocity-animate'
import moment from 'moment'
import _ from 'lodash'

var dateFilterContainer$
var dateFilterMaterialIcon$
var fromContainer$
var toContainer$
var shortCutsContainer$
var selectShortcuts$
var selectFromMonth$
var selectFromYear$
var selectToMonth$
var selectToYear$
var shortCutValues = {
  "Past 3 days": {
    dateStart: () => moment().subtract(3, 'days')
  },
  "Past Week": {
    dateStart: () => moment().subtract(1, 'weeks')
  },
  "Past Month": {
    dateStart: () => moment().subtract(1, 'months')
  },
  "Past 3 Months": {
    dateStart: () => moment().subtract(3, 'months')
  },
  "Past 6 Months": {
    dateStart: () => moment().subtract(6, 'months')
  },
  "Past Year": {
    dateStart: () => moment().subtract(1, 'years')
  }
}

function allFromToIsSet(){
  var fromToSelectsAsArr = [
    selectFromMonth$,
    selectFromYear$,
    selectToMonth$,
    selectToYear$
  ]
  return _.every(fromToSelectsAsArr, item => item.val() !== 'placeholder')
}

function dateFilterResetAll(){
  resetFromTo()
  shortCutsContainer$.removeClass('lightBlue')
  selectShortcuts$.val('placeholder')
  removeResults()
  updateResultsCountDiv(resultsObject.fullResultsCacheArray.length)
  /****
   * chunkResults returns an empty object if resultsObject.fullResultsCacheArray is empty
   */
  replaceResults(null, chunkResults(resultsObject.fullResultsCacheArray))
  if(resultsObject.fullResultsCacheArray.length > 0){
    renderResults(resultsObject.currentResults.chunk_0, null)
  }
}

function resetFromTo(){
  selectFromMonth$.val('placeholder')
  selectFromYear$.val('placeholder')
  selectToMonth$.val('placeholder')
  selectToYear$.val('placeholder')
}

function hideShowDateFilterSubbar(){
  var dataIsShown = dateFilterContainer$.data('isShown')
  if(dataIsShown === 'true'){
    dateFilterContainer$.data('isShown', 'false')
    $.Velocity(dateFilterContainer$[0], "slideUp", { duration: 500, display: 'none' })
        .then(elements => {
          dateFilterMaterialIcon$.removeClass('navBar-materialIcon-selected')
          dateFilterResetAll()
        })
  }
  else{
    dateFilterContainer$.data('isShown', 'true')
    dateFilterMaterialIcon$.addClass('navBar-materialIcon-selected')
    $.Velocity(dateFilterContainer$[0], "slideDown", { duration: 500, display: 'flex' })
  }
}

function filterResults(isShortcut){
  removeResults()
  var dateStartInMilliseconds
  var dateEndInMilliseconds
  if(isShortcut){
    dateStartInMilliseconds = shortCutValues[selectShortcuts$.val()].dateStart().valueOf()
    dateEndInMilliseconds = moment().valueOf()
  }
  else{
    var momentFormattedDateStart = `${selectFromYear$.val()} ${selectFromMonth$.val()}`
    var momentFormattedDateEnd = `${selectToYear$.val()} ${selectToMonth$.val()}`
    dateStartInMilliseconds = moment(momentFormattedDateStart, `YYYY MM`).valueOf()
    dateEndInMilliseconds = moment(momentFormattedDateEnd, `YYYY MM`).valueOf()
  }
  /****
   * Check in case they mistakenly put the end date before the start date
   */
  if(dateEndInMilliseconds > dateStartInMilliseconds){
    var fullResultsCacheArrayCopy = resultsObject.fullResultsCacheArray.slice()
    var dateFilteredResults = _.filter(fullResultsCacheArrayCopy, arrayItem => {
      return (arrayItem.doc.dateCreated >= dateStartInMilliseconds && arrayItem.doc.dateCreated <= dateEndInMilliseconds)
    })
    updateResultsCountDiv(dateFilteredResults.length)
    replaceResults(null, chunkResults(dateFilteredResults))
    if(dateFilteredResults.length > 0){
      renderResults(resultsObject.currentResults.chunk_0, null)
    }
  }
  else{
    updateResultsCountDiv(0)
  }
}

function dateFilter(){
  //formplate($('body'))
  var subBar$ = $('.subBar')
  var dateFilterNavButtonContainer$ = $('.dateFilter')
  var dateFilterButton$ = $('a', dateFilterNavButtonContainer$)
  var otherNavMaterialIcons$ = $('.addPage .material-icons, .settings-etal .material-icons')
  dateFilterMaterialIcon$ = $('.material-icons', dateFilterButton$)
  shortCutsContainer$ = $('.shortcutsContainer')
  dateFilterContainer$ = $('.dateFilterSettings')
  fromContainer$ = $('.fromContainer')
  toContainer$ = $('.toContainer')
  selectFromMonth$ = $('.selectFromMonth', fromContainer$)
  selectFromYear$ = $('.selectFromYear', fromContainer$)
  selectToMonth$ = $('.selectToMonth', toContainer$)
  selectToYear$ = $('.selectToYear', toContainer$)
  selectShortcuts$ = $('.shortcuts', shortCutsContainer$)

  var currentYear = moment().year()
  /****
   * 2016 - year MarkSearch was released, so don't need any earlier
   */
  var msReleaseDate = 2000
  var numYearsToInclude = (currentYear - msReleaseDate) + 1
  /****
   * num starts at 0
   */
  _.times(numYearsToInclude, num => {
    var year = msReleaseDate + num
    $('<option>', {text: year, value: year}).appendTo('.selectFromYear, .selectToYear')
  })

  selectShortcuts$.change(event => {
    resetFromTo()
    shortCutsContainer$.removeClass('lightBlue')
    filterResults(true)
  })

  selectFromMonth$.change(event => {
    /****
     * check if all rest is set, then filter results
     */
    if(allFromToIsSet()){
      filterResults(false)
    }
  })

  selectFromYear$.change(event => {
    fromContainer$.removeClass('lightBlue')
    /****
     * If the month hasn't been selected yet, select January
     */
    if(selectFromMonth$.val() === 'placeholder'){
      selectFromMonth$.val('1')
    }
    if(allFromToIsSet()){
      shortCutsContainer$.addClass('lightBlue')
      selectShortcuts$.val('placeholder')
      filterResults(false)
    }
  })

  selectToMonth$.change(event => {
    if(allFromToIsSet()){
      filterResults(false)
    }
  })

  selectToYear$.change(event => {
    toContainer$.removeClass('lightBlue')
    if(selectToMonth$.val() === 'placeholder'){
      selectToMonth$.val('1')
    }
    if(allFromToIsSet()){
      shortCutsContainer$.addClass('lightBlue')
      selectShortcuts$.val('placeholder')
      filterResults(false)
    }
  })

  dateFilterButton$.click(event => {
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
export { dateFilter, dateFilterResetAll, filterResults, allFromToIsSet }