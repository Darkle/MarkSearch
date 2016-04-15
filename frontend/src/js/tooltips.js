'use strict'

/* global markSearchSettings */

import { checkIfTouchDevice } from './checkIfTouchDevice'

/****
 * Show the tooltips and keep showing them until results have been shown
 * for the first time.
 * Here we are actually only checking how many times the tooltips have been shown
 * when there was also results displayed.
 */

function tooltips() {

  var tooltipsHaveBeenShownWithResults = Boolean(window.localStorage.tooltipsHaveBeenShownWithResults)

  if(markSearchSettings.alwaysDisableTooltips || tooltipsHaveBeenShownWithResults || checkIfTouchDevice(window)){
    return
  }

  var resultsShown = $('#addRemoveDiv>div').length

  if(resultsShown){
    if(!tooltipsHaveBeenShownWithResults){
      window.localStorage.tooltipsHaveBeenShownWithResults = true
    }
  }

  $.protip({
    defaults: {
      position: 'bottom'
    }
  })

}

export { tooltips }