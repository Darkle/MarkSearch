'use strict';

import "babel-polyfill" //needs to be first

import { generateBookmarkletJS } from './bookmarkletTemplate'

import got from 'got'
import notie from 'notie'
import _ from 'lodash'

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  var csrfToken = $('#csrfInput').val()
  $('.brandLogo').removeAttr()
  formplate($('body'))
  buttonplate($('.button'))
  new Clipboard('.clipBoardButton')
  var xhrHeaders = {
      'X-CSRF-Token': csrfToken
  }
  /****
   * files[0].path only returns the path (with no trailing slash) so remove the filename and trailing
   * slash from the markSearchSettings.pagesDBFilePath
   */
  markSearchSettings.pagesDBFilePath = JSON.parse(markSearchSettings.pagesDBFilePath).slice(0, -19)

  /****
   * formplate moves things around, so grab elements after its
   * done its thing
   */
  var prebrowsingCheckbox$ = $('#prebrowsingCheckbox')
  var alwaysDisableTooltipsCheckbox$ = $('#alwaysDisableTooltipsCheckbox')
  var browserAddonTokenButton$ = $('#browserAddonTokenButton')
  var browserAddonTokenText$ = $('#browserAddonTokenText')
  var bookmarkletButton$ = $('#bookmarkletButton')
  var emailBookmarkletButton$ = $('#emailBookmarkletButton')
  var bookmarkletEmail$ = $('#bookmarkletEmail')
  var bookmarkletText$ = $('#bookmarkletText')
  var dbLocationText$ = $('.dbLocationContainer .locationText')
  //var dragAndDropDiv$ = $('#dragAndDrop')
  var changeDBLocInput$ = $('#changeDBLocationInput')
  var changeDBLocButton$ = $('#changeDBLocationButton')
  var notieAlert$ = $('#notie-alert-outer')
  var cancelSettingsButton$ = $('.cancelSettingsButton')
  var saveSettingsButtonButton$ = $('.saveSettingsButton')
  var dbLocationInfoTitle$ = $('#dbLocationInfoTitle')


  /****
   * External links
   */
  $('.externalLink').click(event => {
    event.preventDefault()
    var urlToOpen = encodeURIComponent($(event.currentTarget).attr('href'))
    got.post(`/frontendapi/openUrlInBrowser/${urlToOpen}`, {headers: xhrHeaders})
      .catch( err => {
        console.error(err)
      })
  })

  /****
   * Generate browser addon token
   */
  browserAddonTokenButton$.click( event => {
    event.preventDefault()
    got.post('/frontendapi/settings/generateExtToken', {headers: xhrHeaders})
      .then( response => {
        var responseData = JSON.parse(response.body)
        /****
         * Include the url of MarkSearch so user doesn't have to copy & past that
         * into the extension as well
         */
        browserAddonTokenText$.val(`${responseData.protocolIpandPort},${responseData.token}`)
      })
      .catch( err => {
        console.error(err)
      })
  })

  /****
   * Generate bookmarklet
   */
  bookmarkletButton$.click( event => {
    event.preventDefault()
    got.post('/frontendapi/settings/generateExtToken', {headers: xhrHeaders})
      .then( response => {
        var responseData = JSON.parse(response.body)
        var bookmarkletJS = generateBookmarkletJS(responseData.protocolIpandPort, responseData.token)
        bookmarkletText$.val(`javascript:${encodeURIComponent(bookmarkletJS)}`)
      })
      .catch( err => {
        console.error(err)
      })
  })
  /****
   * Email bookmarklet
   */
  emailBookmarkletButton$.click( event => {
    event.preventDefault()

    got.post('/frontendapi/settings/generateExtToken', {headers: xhrHeaders})
      .then( response => {
        var responseData = JSON.parse(response.body)
        var bookmarkletJS = generateBookmarkletJS(responseData.protocolIpandPort, responseData.token)
        var generatedBookmarkletText = `javascript:${encodeURIComponent(bookmarkletJS)}`
        var bookmarkletEmail = bookmarkletEmail$.val()
        return got.post('/frontendapi/settings/emailBookmarklet',
                {
                  headers: xhrHeaders,
                  body: {
                    email: JSON.stringify(bookmarkletEmail),
                    bookmarkletText: generatedBookmarkletText
                  }
                }
              )
      })
      .then(response => {
        notieAlert$.removeClass('notie-alert-success notie-alert-error')
        notieAlert$.addClass('notie-alert-success')
        notie.alert(1, 'Email Sent. (check your spam folder)', 5)
      })
      .catch( err => {
        console.error(err)
        notieAlert$.removeClass('notie-alert-success notie-alert-error')
        notieAlert$.addClass('notie-alert-error')
        notie.alert(
          3,
          `There Was An Error Sending The Email.
          Error: ${JSON.parse(_.get(err, 'response.body'))}`,
          6
        )
      })
  })

  /****
   * Prebrowsing
   */
  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }

  /****
   * Always Disable Tooltips
   */
  if(markSearchSettings.alwaysDisableTooltips){
    alwaysDisableTooltipsCheckbox$.prop('checked', true)
    alwaysDisableTooltipsCheckbox$.parent().addClass('checked')
  }

  /****
   * Current Database Location
   */
  dbLocationText$.text(markSearchSettings.pagesDBFilePath)
  changeDBLocButton$.click(event => {
    event.preventDefault()
    changeDBLocInput$.click()
  })


  changeDBLocInput$.change(event => {
    var files = changeDBLocInput$[0].files
    if(files.length > 0){
      console.log(files[0].path)
      dbLocationText$.text(files[0].path)
      if(markSearchSettings.pagesDBFilePath !== _.trim(dbLocationText$.text())){
        dbLocationInfoTitle$.text('Database Will Be Moved To:')
      }
    }
  })

  saveSettingsButtonButton$.click( event => {
    event.preventDefault()
    var possibleDBchangePromise = Promise.resolve()
    var dbLocationText = _.trim(dbLocationText$.text())

    if(markSearchSettings.pagesDBFilePath !== dbLocationText){
      possibleDBchangePromise = got.post('/frontendapi/settings/changePagesDBlocation',
        {
          headers: xhrHeaders,
          body: {
            newPagesDBFileFolder: dbLocationText,
            oldPagesDBFilePath: markSearchSettings.pagesDBFilePath
          }
        }
      )
      .then(response => JSON.parse(response.body).newPagesDBFilePath)
    }

    possibleDBchangePromise
      .then( newPagesDBFilePath => {
        var settings = {
          prebrowsing: prebrowsingCheckbox$[0].checked,
          alwaysDisableTooltips: alwaysDisableTooltipsCheckbox$[0].checked
        }
        if(newPagesDBFilePath){
          settings.pagesDBFilePath = newPagesDBFilePath
        }
        return settings
      })
      .then( settings =>
        got.post('/frontendapi/settings/update',
          {
            headers: xhrHeaders,
            body: settings
          }
        )
      )
      .then( response => {
        notieAlert$.removeClass('notie-alert-success notie-alert-error')
        notieAlert$.addClass('notie-alert-success')
        notie.alert(1, 'Settings Saved', 3.4)
      })
      .catch( err => {
        console.error(err)
        notieAlert$.removeClass('notie-alert-success notie-alert-error')
        notieAlert$.addClass('notie-alert-error')
        var errorMessage = _.get(err, 'message')
        var responseBody = _.trim(_.get(err, 'response.body'))
        var parsedResponseBody
        if(responseBody.length){
          parsedResponseBody = JSON.parse(responseBody)
        }
        if(_.get(parsedResponseBody, 'errorMessage')){
          errorMessage = parsedResponseBody.errorMessage
        }
        notie.alert(
          3,
          `There Was An Error Saving The Settings.
          Error: ${errorMessage}`,
          6
        )
      })
  })

  cancelSettingsButton$.click( event => {
    event.preventDefault()
    window.close()
  })

}
