'use strict';

import "babel-polyfill" //needs to be first

import got from 'got'


$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  var csrfToken = $('#csrfInput').val()
  var tokenButton$ = $('#tokenButton')
  var tokenText$ = $('#tokenText')
  var prebrowsingSettingContainer$ = $('.prebrowsingSettingContainer')

  formplate($('body'))
  buttonplate($('.button'))
  new Clipboard('#clipBoardButton')

  /****
   * formplate moves things around, so grab some elements after its
   * done its thing
   */
  var prebrowsingCheckbox$ = $('#prebrowsingCheckbox')


  /****
   * Formplate adds a 'checked' class to the span parent of the
   * checkboxes. The 'checked' class adds a ':before" to the span
   * to show the styled tick checkbox. This seems to mess up the
   * checkbox onchange event, specifically unchecking the select box
   * doesn't fire the onchange event anymore, so gonna do onclick
   * for the .formplate-checkbox spans
   */
  var formplateCheckBoxes$ = $('.settings .formplate-checkbox')

  $('.settings input[type="checkbox"]').change( event => {
    console.log('checkbox change')
    //$(event.currentTarget).parent().toggleClass('checked')
  })

  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }

  tokenButton$.click( event => {
    event.preventDefault()
    got.post('/settings/generateJWTExtensionToken',
        {
          headers: {
            'X-CSRF-Token': csrfToken
          }
        }
    )
    .then( response => {
      var responseData = JSON.parse(response.body)
      tokenText$.val(responseData.token)
    })
    .catch( err => {
      console.error(err)
    })
  })
}
