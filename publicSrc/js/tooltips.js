'use strict';

/****
 * Show the tooltips for the first three times the page is loaded.
 * Also show the tooltips again when there are results, to help to
 * show the user what the archive/delete buttons are.
 */

var tooltips = () => {
  var generalToolTipsShown = window.localStorage.generalToolTipsShown
  var generalToolTipsShownNumber = Number(generalToolTipsShown)
  var resultsToolTipsShown = window.localStorage.resultsToolTipsShown
  var resultsToolTipsShownAsNumber = Number(resultsToolTipsShown)
  if(!generalToolTipsShown){
    window.localStorage.generalToolTipsShown = '1'
    $.protip({
      defaults: {
        position: 'bottom'
      }
    })
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
    }
    else if(window.localStorage.haveResults === 'true'){
      if(!resultsToolTipsShown){
        resultsToolTipsShown = window.localStorage.resultsToolTipsShown = '1'
        resultsToolTipsShownAsNumber = Number(resultsToolTipsShown)
      }
      else{
        resultsToolTipsShownAsNumber++
      }
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