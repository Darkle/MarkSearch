'use strict';

import { haveShownSomeResults, set_haveShownSomeResults, haveShownResultsTooltips, set_haveShownResultsTooltips } from './searchPage'

/****
 * Show the tooltips for the first three times the page is loaded.
 * Also show the tooltips again when there are results, to help to
 * show the user what the archive/delete buttons are.
 */

var generalToolTipsShown = window.localStorage.generalToolTipsShown
var generalToolTipsShownNumber = Number(generalToolTipsShown)
var resultsToolTipsShown = window.localStorage.resultsToolTipsShown
var resultsToolTipsShownAsNumber = Number(resultsToolTipsShown)

function resultsToolTipsHaveBeenShown(){
  set_haveShownResultsTooltips(true)
  window.localStorage.haveShownResultsTooltips = 'true'
  if(!resultsToolTipsShown){
    resultsToolTipsShownAsNumber = 0
  }
  resultsToolTipsShownAsNumber++
  if(resultsToolTipsShownAsNumber < 3){
    window.localStorage.resultsToolTipsShown = `${resultsToolTipsShownAsNumber}`
  }
}

var tooltips = () => {
  console.log('generalToolTipsShown : ', generalToolTipsShown)
  console.log('generalToolTipsShownNumber : ', generalToolTipsShownNumber)
  console.log('resultsToolTipsShown : ', resultsToolTipsShown)
  console.log('resultsToolTipsShownAsNumber : ', resultsToolTipsShownAsNumber)
  console.log('haveShownResultsTooltips : ', haveShownResultsTooltips)
  console.log('haveShownSomeResults : ', haveShownSomeResults)
  if(!generalToolTipsShown){
    window.localStorage.generalToolTipsShown = '1'
    $.protip({
      defaults: {
        position: 'bottom'
      }
    })
    if(haveShownSomeResults){
      resultsToolTipsHaveBeenShown()
    }
  }
  else{
    generalToolTipsShownNumber++
    if(generalToolTipsShownNumber < 4){
      window.localStorage.generalToolTipsShown = `${generalToolTipsShownNumber}`
      $.protip({
        defaults: {
          position: 'bottom'
        }
      })
      if(haveShownSomeResults){
        resultsToolTipsHaveBeenShown()
      }
    }
    else if(!haveShownResultsTooltips && haveShownSomeResults || resultsToolTipsShownAsNumber < 3){
      resultsToolTipsHaveBeenShown()
      if(resultsToolTipsShownAsNumber < 3){
        window.localStorage.resultsToolTipsShown = `${resultsToolTipsShownAsNumber}`
        $.protip({
          defaults: {
            position: 'bottom'
          }
        })
      }
    }
  }
}
/****
 * Exports
 */
export { tooltips }