'use strict';

import { dateFilterResetAll, checkMatchMediaForResultsContainerMarginTop } from './dateFilter'

var settingsAndHelpContainer$
var settingsButtonMaterialIcon$

function hideShowSettingsSubbar(){
  var dataIsShown = settingsAndHelpContainer$.data('isShown')
  if(dataIsShown === 'true'){
    settingsAndHelpContainer$.data('isShown', 'false')
    $.Velocity(settingsAndHelpContainer$[0], "slideUp", { duration: 500, display: 'none' })
        .then(elements => {
          settingsButtonMaterialIcon$.removeClass('navBar-materialIcon-selected')
        })
  }
  else{
    settingsAndHelpContainer$.data('isShown', 'true')
    settingsButtonMaterialIcon$.addClass('navBar-materialIcon-selected')
    $.Velocity(settingsAndHelpContainer$[0], "slideDown", { duration: 500, display: 'flex' })
  }
}

function settingsSubbarInit(){
  var subBar$ = $('.subBar')
  var settingsButton$ = $('#settingsButton')
  var otherNavMaterialIcons$ = $('.addPage .material-icons, .dateFilter .material-icons')
  var resultsOuterContainer$ = $('#resultsOuterContainer')
  settingsButtonMaterialIcon$ = $('.material-icons', settingsButton$)
  settingsAndHelpContainer$ = $('.settingsAndHelp')

  $('.settingsLinkButton').click(event => { window.location = '/settingsPage' })
  $('.helpAboutLinkButton').click(event => { window.location = '/help_about' })

  settingsButton$.click(event => {
    event.preventDefault()
    var currentlyShownSubBar$ = subBar$.children()
        .filter( (index, elem) => $(elem).data('isShown') === 'true')
    /****
     * If there is a subBar being shown and it is not the settingsAndHelpContainer$,
     * hide it and show the settingsAndHelpContainer$
     */
    if(currentlyShownSubBar$[0] && currentlyShownSubBar$[0] !== settingsAndHelpContainer$[0]){
      settingsButtonMaterialIcon$.addClass('navBar-materialIcon-selected')
      if(currentlyShownSubBar$.hasClass('dateFilterSettings')){
        $.Velocity(resultsOuterContainer$[0], { marginTop: checkMatchMediaForResultsContainerMarginTop() }, 500)
      }
      $.Velocity(currentlyShownSubBar$[0], "slideUp", { duration: 500, display: 'none' })
          .then(elems => {
            currentlyShownSubBar$.data('isShown','false')
            otherNavMaterialIcons$.removeClass('navBar-materialIcon-selected navBar-materialIcon-hover')
            /****
             * If hiding the date filter subbar, reset the results and the settings in the date filter module
             */
            if(currentlyShownSubBar$.hasClass('dateFilterSettings')){
              dateFilterResetAll()
            }
            hideShowSettingsSubbar()
          })
    }
    /****
     * Else show/hide the Settings subbar
     */
    else {
      hideShowSettingsSubbar()
    }
  })
}

/****
 * Exports
 */
export { settingsSubbarInit }