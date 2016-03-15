'use strict';

import velocity from 'velocity-animate'

import { addPageUrlsDiv$, progressBar$, errorOKbutton$, progressInfo$ } from './settingsPage'

function showAddPageSubbar(){
  return $.Velocity(addPageUrlsDiv$[0], "slideDown", { duration: 500, display: 'flex' })
}

function hidePageSubbarAndReset(){
  return $.Velocity(
    addPageUrlsDiv$[0],
    "slideUp",
    {
      duration: 500,
      display: 'none'
    }
    )
    .then(() => {
      progressBar$.width(0)
      errorOKbutton$.addClass('hide')
      progressInfo$.text(``)
      progressBar$.removeClass('hide')
      progressInfo$.css('overflow-y', 'visible')
    })
}

export { showAddPageSubbar, hidePageSubbarAndReset }