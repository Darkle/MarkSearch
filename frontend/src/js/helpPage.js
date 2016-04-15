'use strict'

import $ from 'jquery'

$(document).ready(() => {
  var helpPageBackButtonContainer = $('.helpPageBackButtonContainer')
  var backButtonIcon = $('#helpPageBackButton .material-icons')
  helpPageBackButtonContainer.addClass('showFlex')
  helpPageBackButtonContainer
    .hover(
      () => {
        backButtonIcon.addClass('navBar-materialIcon-hover')
      },
      () => {
        backButtonIcon.removeClass('navBar-materialIcon-hover')
      }
    )
    .on('touchend',
      () => {
        backButtonIcon.removeClass('navBar-materialIcon-hover')
      }
    )
  $('#helpPageBackButton').click(event => {
    event.preventDefault()
    window.history.back()
  })
})

