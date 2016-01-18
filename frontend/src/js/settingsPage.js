'use strict';

import "babel-polyfill" //needs to be first

import { generateBookmarkletJS } from './bookmarkletTemplate'

import got from 'got'

var csrfToken

function saveAndSendSettings(settingKey, settingValue){
  markSearchSettings[settingKey] = settingValue
  got.post('/settings/update',
      {
        headers: {
          'X-CSRF-Token': csrfToken,
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(
            {
              settingKey: settingKey,
              settingValue: settingValue
            }
        )
      }
  )
  .catch( err => {
    console.error(err)
  })
}

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  csrfToken = $('#csrfInput').val()
  formplate($('body'))
  buttonplate($('.button'))
  new Clipboard('.clipBoardButton')

  var locationHostAndProtocol = `${window.location.protocol}//${window.location.host}`

  /****
   * formplate moves things around, so grab elements after its
   * done its thing
   */

  var prebrowsingCheckbox$ = $('#prebrowsingCheckbox')
  var browserAddonTokenButton$ = $('#browserAddonTokenButton')
  var browserAddonTokenText$ = $('#browserAddonTokenText')
  var bookmarkletButton$ = $('#bookmarkletButton')
  var bookmarkletText$ = $('#bookmarkletText')
  var dbLocationText$ = $('.dbLocationContainer .locationText')
  var dragAndDropDiv$ = $('#dragAndDrop')

  /****
   * If end up implementing searchLoose, remember to change the searchLoose
   * variable (set_searchingLoose()) as well as the searchLoose value in the
   * markSearchSettings global object - and also alter code serverSide
   */

  /****
   * Prebrowsing setting
   */
  prebrowsingCheckbox$.data('settingKeyName', 'prebrowsing')
  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }
  prebrowsingCheckbox$.change( event => {
    var settingKey = prebrowsingCheckbox$.data('settingKeyName')
    var settingValue = prebrowsingCheckbox$.prop('checked')
    saveAndSendSettings(settingKey, settingValue)
  })

  /****
   * Generate browser addon token
   */
  browserAddonTokenButton$.click( event => {
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
      /****
       * Include the url of MarkSearch so user doesn't have to copy & past that
       * into the extension as well
       */
      browserAddonTokenText$.val(`${locationHostAndProtocol},${responseData.token}`)
    })
    .catch( err => {
      console.error(err)
    })
  })

  /****
   * Current Database Location
   */
  dbLocationText$.text(markSearchSettings.pagesDBFilePath)

  /****
   * Generate bookmarklet
   */
  //bookmarkletButton$.click( event => {
  //  event.preventDefault()
  //  got.post('/settings/generateJWTBookmarkletToken',
  //      {
  //        headers: {
  //          'X-CSRF-Token': csrfToken
  //        }
  //      }
  //      )
  //      .then( response => {
  //        var responseData = JSON.parse(response.body)
  //        var bookmarkletJS = generateBookmarkletJS(locationHostAndProtocol, responseData.token)
  //        bookmarkletText$.val(`javascript:${encodeURIComponent(bookmarkletJS)}`)
  //      })
  //      .catch( err => {
  //        console.error(err)
  //      })
  //})
}
