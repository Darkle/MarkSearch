'use strict';

import $ from 'jquery'

$(document).ready(event => {
  var helpPageBackButtonContainer = $('.helpPageBackButtonContainer')
  var backButtonIcon = $('#helpPageBackButton .material-icons')
  helpPageBackButtonContainer.addClass('showFlex')
  helpPageBackButtonContainer
    .hover(
      (event) => {
        backButtonIcon.addClass('navBar-materialIcon-hover')
      },
      (event) => {
        backButtonIcon.removeClass('navBar-materialIcon-hover')
      }
    )
    .on('touchend',
      (event) => {
        backButtonIcon.removeClass('navBar-materialIcon-hover')
      }
    )
  $('#helpPageBackButton').click(event => {
    event.preventDefault()
    window.history.back()
  })
})

