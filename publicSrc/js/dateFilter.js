'use strict';

import { removeResults } from './removeResults'
import { resultsObject, replaceResults } from './resultsObject'
import { chunkResults } from './chunkResults'
import { renderResults } from './renderResults'
import { updateResultsCountDiv } from './updateResultsCountDiv'

import velocity from 'velocity-animate'
import moment from 'moment'
import _ from 'lodash'

var resultsOuterContainer$
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
var resultsContainerMarginValues = {
  50: 172,
  100: 184,
  140: 220.8
}
var selectElemRelatedElements = {
  'selectFromMonth': {
    parent: () => fromContainer$,
    siblingSelect: () => selectFromYear$
  },
  'selectFromYear': {
    parent: () => fromContainer$,
    siblingSelect: () => selectFromMonth$
  },
  'selectToMonth': {
    parent: () => toContainer$,
    siblingSelect: () => selectToYear$
  },
  'selectToYear': {
    parent: () => toContainer$,
    siblingSelect: () => selectToMonth$
  },
}
var ph = 'placeholder'

function checkMatchMediaForResultsContainerMarginTop(){
  var marginTop = 140
  if(window.matchMedia("(max-width: 54.5em)").matches){
    marginTop = 84
  }
  return marginTop
}

function allFromToIsSet(){
  var fromToSelectsAsArr = [
    selectFromMonth$,
    selectFromYear$,
    selectToMonth$,
    selectToYear$
  ]
  return _.every(fromToSelectsAsArr, item => item.val() !== ph)
}

function selectFromToHandler(event){
  var selectElem$ = $(event.currentTarget)
  var relatedElems = selectElemRelatedElements[selectElem$[0].className]
  if(selectElem$.val() !== ph && relatedElems.siblingSelect().val() !== ph){
    relatedElems.parent().removeClass('lightBlue')
  }
  /****
   * If they are resetting this select
   */
  if(selectElem$.val() === ph){
    relatedElems.parent().addClass('lightBlue')
    dateFilterResetAll(true)
  }
  /****
   * If all are set, filter results
   */
  else if(allFromToIsSet()){
    shortCutsContainer$.addClass('lightBlue')
    selectShortcuts$.val(ph)
    filterResults(false)
  }
}

function dateFilterResetAll(dateFilterSubbarStillOpen){
  if(!dateFilterSubbarStillOpen){
    resetFromTo()
    $(window).off('resize')
    resultsOuterContainer$.css('margin-top', '')
    shortCutsContainer$.removeClass('lightBlue')
  }
  selectShortcuts$.val(ph)
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
  selectFromMonth$.val(ph)
  selectFromYear$.val(ph)
  selectToMonth$.val(ph)
  selectToYear$.val(ph)
  fromContainer$.addClass('lightBlue')
  toContainer$.addClass('lightBlue')
}

function hideShowDateFilterSubbar(){
  var dataIsShown = dateFilterContainer$.data('isShown')
  if(dataIsShown === 'true'){
    dateFilterContainer$.data('isShown', 'false')
    $.Velocity(resultsOuterContainer$[0], { marginTop: checkMatchMediaForResultsContainerMarginTop() }, 500)
    $.Velocity(dateFilterContainer$[0], "slideUp", { duration: 500, display: 'none' })
        .then(elements => {
          dateFilterMaterialIcon$.removeClass('navBar-materialIcon-selected')
          dateFilterResetAll()
        })
  }
  else{
    dateFilterContainer$.data('isShown', 'true')
    dateFilterMaterialIcon$.addClass('navBar-materialIcon-selected')
    var marginTopValue = resultsContainerMarginValues[dateFilterContainer$.height()]
    resultsOuterContainer$.velocity({ marginTop: marginTopValue }, 500)
    $.Velocity(dateFilterContainer$[0], "slideDown", { duration: 500, display: 'flex' })
    $(window).resize(
        _.debounce(
            () => {
              resultsOuterContainer$.velocity({ marginTop: resultsContainerMarginValues[dateFilterContainer$.height()] }, 500)
            },
            500,
            {
              'leading': false,
              'trailing': true
            }
        )
    )
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
    /****
     * When using `YYYY MM` format, month starts at 1
     */
    dateStartInMilliseconds = moment(`${selectFromYear$.val()} ${selectFromMonth$.val()}`, `YYYY MM`).valueOf()
    /****
     * For date end, we want to include all of the end date month, not just the start
     * of that month, but include all the days of that month up to 23:59 of the last
     * day in that month.
     *
     * note: When using .add(n, 'months'), if you had a moment that was
     * "Friday, January 1st 2016, 12:00:00 am", then using .add(12, 'months')
     * would equate to "Sunday, January 1st 2017, 12:00:00 am", because it's
     * already in January - remember that you're adding aditional months on to
     * what is already there, so 12 months after January is January in the next year
     * - in other words, think of it as zero-based
     *
     * So selectToMonthAsNum ends up being a month ahead of what the user selected, then
     * we take away a second, which leaves us with the whole month the user slelected,
     * including all the days of that month
     */
    var selectToMonthAsNum = Number(selectToMonth$.val())
    dateEndInMilliseconds = moment(`${selectToYear$.val()}`, `YYYY`)
        .add(selectToMonthAsNum, 'months')
        .subtract().subtract(1, 'second')
        .valueOf()
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
  formplate($('body'))
  var subBar$ = $('.subBar')
  var dateFilterNavButtonContainer$ = $('.dateFilter')
  var dateFilterButton$ = $('a', dateFilterNavButtonContainer$)
  var otherNavMaterialIcons$ = $('.addPage .material-icons, .settings-etal .material-icons')
  resultsOuterContainer$ = $('#resultsOuterContainer')
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

  _.times(numYearsToInclude, index => {
    var year = msReleaseDate + index
    $('<option>', {text: year, value: year}).appendTo('.selectFromYear, .selectToYear')
  })

  selectShortcuts$.change(event => {
    if(selectShortcuts$.val() === ph){
      dateFilterResetAll(true)
    }
    else{
      resetFromTo()
      shortCutsContainer$.removeClass('lightBlue')
      filterResults(true)
    }
  })

  selectFromMonth$.change(selectFromToHandler)
  selectFromYear$.change(selectFromToHandler)
  selectToMonth$.change(selectFromToHandler)
  selectToYear$.change(selectFromToHandler)

  dateFilterButton$.click(event => {
    event.preventDefault()
    var currentlyShownSubBar$ = subBar$.children()
        .filter( (index, elem) => $(elem).data('isShown') === 'true')
    /****
     * If there is a subBar being shown and it is not the dateFilterContainer$,
     * hide it and show the dateFilterContainer$
     */
    if(currentlyShownSubBar$[0] && currentlyShownSubBar$[0] !== dateFilterContainer$[0]){
      dateFilterMaterialIcon$.addClass('navBar-materialIcon-selected')
      $.Velocity(currentlyShownSubBar$[0], "slideUp", { duration: 500, display: 'none' })
          .then(elems => {
            currentlyShownSubBar$.data('isShown','false')
            otherNavMaterialIcons$.removeClass('navBar-materialIcon-selected navBar-materialIcon-hover')
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
export { dateFilter, dateFilterResetAll, filterResults, allFromToIsSet, checkMatchMediaForResultsContainerMarginTop }