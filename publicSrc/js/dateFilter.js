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
var fromToSet = {
  fromMonthSet: false,
  fromYearSet: false,
  toMonthSet: false,
  toYearSet: false,
}

function allFromToIsSet(){
  return _.every(fromToSet, item => item)
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

function dateFilterResetAll(){
  resetFromTo()
  resetShortcuts()
  resetResults()
}

function resetShortcuts(){
  shortCutsContainer$.removeClass('lightBlue')
  nsShortcutsCurrentText$.text('Shortcuts')
}

function resetFromTo(){
  nsFromMonthCurrentText$.text('Month')
  nsToMonthCurrentText$.text('Month')
  nsFromYearCurrentText$.text('Year')
  nsToYearCurrentText$.text('Year')
  fromContainer$.addClass('lightBlue')
  toContainer$.addClass('lightBlue')
  fromToSet.fromMonthSet = false
  fromToSet.fromYearSet = false
  fromToSet.toMonthSet = false
  fromToSet.toYearSet = false
}

function resetResults(){
  removeResults()
  var chunkedResultsObject = {}
  updateResultsCountDiv(resultsObject.fullResultsCacheArray.length)
  /****
   * chunkResults returns an empty object if resultsObject.fullResultsCacheArray is empty
   */
  replaceResults(null, chunkResults(resultsObject.fullResultsCacheArray))
  if(resultsObject.fullResultsCacheArray.length > 0){
    renderResults(resultsObject.currentResults.chunk_0, null)
  }
}

function filterResults(listElement , isShortcut){
  removeResults()
  var dateStartInMilliseconds
  var dateEndInMilliseconds
  var elemValue = $(listElement).data('value')
  if(isShortcut){
    var shortObjVal = shortCutValues[elemValue]
    dateStartInMilliseconds = shortObjVal.dateStart().valueOf()
    dateEndInMilliseconds = moment().valueOf()
  }
  else{
    var fromToValues = {
      selectFromMonthValue: $('.selected', nsSelectFromMonth$).data('value'),
      selectFromYearValue: $('.selected', nsSelectFromYear$).data('value'),
      selectToMonthValue: $('.selected', nsSelectToMonth$).data('value'),
      selectToYearValue: $('.selected', nsSelectToYear$).data('value')
    }
    /****
     * The value for the clicked li element isn't set yet, so grab the value of the listElement and
     * assign it to fromToValues key
     */
    fromToValues[$(listElement).data('fromToValueKeyName')] = elemValue
    dateStartInMilliseconds = moment(`${fromToValues.selectFromYearValue} ${fromToValues.selectFromMonthValue}`, `YYYY MM`).valueOf()
    dateEndInMilliseconds = moment(`${fromToValues.selectToYearValue} ${fromToValues.selectToMonthValue}`, `YYYY MM`).valueOf()
  }
  /****
   * Check in case they mistakenly put the end date before the start date
   */
  if(dateEndInMilliseconds > dateStartInMilliseconds){
    var fullResultsCacheArrayCopy = resultsObject.fullResultsCacheArray.slice()
    var dateFilteredResults = _.filter(fullResultsCacheArrayCopy, arrayItem =>{
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
  var subBar$ = $('.subBar')
  var dateFilterNavButtonContainer$ = $('.dateFilter')
  var dateFilterButton$ = $('a', dateFilterNavButtonContainer$)
  var otherNavMaterialIcons$ = $('.addPage .material-icons, .settings-etal .material-icons')
  shortCutsContainer$ = $('.shortcutsContainer')
  dateFilterContainer$ = $('.dateFilterSettings')
  dateFilterMaterialIcon$ = $('.material-icons', dateFilterButton$)
  fromContainer$ = $('.fromContainer')
  toContainer$ = $('.toContainer')

  var currentYear = moment().year()
  /****
   * 2016 - year MarkSearch was released, so don't need any earlier
   */
  var msReleaseDate = 2000
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
  $([nsSelectFromMonth$, nsSelectFromYear$, nsSelectToMonth$, nsSelectToYear$]).each( (index, element$) => {
    element$.find('li').attr('data-from-to-value-key-name', `${element$[0].className.slice(12)}Value`)
  })

  resetFromTo()
  nsShortcutsCurrentText$.text('Shortcuts')

  $('.list li', nsSelectShortcuts$).click(event => {
    resetFromTo()
    shortCutsContainer$.removeClass('lightBlue')
    filterResults(event.currentTarget, true)
  })

  $('.list li', nsSelectFromMonth$).click(event => {
    fromToSet.fromMonthSet = true
    /****
     * check if all rest is set, then filter results
     */
    if(allFromToIsSet()){
      filterResults(event.currentTarget, false)
    }
  })

  $('.list li', nsSelectFromYear$).click(event => {
    fromContainer$.removeClass('lightBlue')
    fromToSet.fromYearSet = true
    if(!fromToSet.fromMonthSet){
      fromToSet.fromMonthSet = true
      nsFromMonthCurrentText$.text('January')
    }
    if(allFromToIsSet()){
      shortCutsContainer$.addClass('lightBlue')
      nsShortcutsCurrentText$.text('Shortcuts')
      filterResults(event.currentTarget, false)
    }
  })

  $('.list li', nsSelectToMonth$).click(event => {
    fromToSet.toMonthSet = true
    if(allFromToIsSet()){
      filterResults(event.currentTarget, false)
    }
  })

  $('.list li', nsSelectToYear$).click(event => {
    toContainer$.removeClass('lightBlue')
    fromToSet.toYearSet = true
    if(!fromToSet.toMonthSet){
      nsToMonthCurrentText$.text('January')
      fromToSet.toMonthSet = true
    }
    if(allFromToIsSet()){
      shortCutsContainer$.addClass('lightBlue')
      nsShortcutsCurrentText$.text('Shortcuts')
      filterResults(event.currentTarget, false)
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
export { dateFilter, dateFilterResetAll }