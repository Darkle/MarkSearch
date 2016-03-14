'use strict';

/* globals markSearchSettings: true, Clipboard  */

import "babel-polyfill"
import { generateBookmarkletJS } from '../bookmarkletTemplate'
import { showNotie } from './showNotie'
import { getErrorMessage } from './getErrorMessage'
import { importUrls } from './importUrls'
import { exportUrls } from './exportUrls'
import { hidePageSubbarAndReset } from './hideShowAddPageSubbar'

import got from 'got'
import Promise from 'bluebird'

var xhrHeaders
var addPageUrlsDiv$
var progressBar$
var errorOKbutton$
var progressInfo$
var addUrlsProgress$
var notieAlert$

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  var prebrowsingCheckbox$ = $('#prebrowsingCheckbox')
  var alwaysDisableTooltipsCheckbox$ = $('#alwaysDisableTooltipsCheckbox')
  var dbLocationText$ = $('.dbLocationContainer .locationText')
  var bookmarkExpiryCheckbox$ = $('#bookmarkExpiryCheckbox')
  var browserAddonTokenButton$ = $('#browserAddonTokenButton')
  var browserAddonTokenText$ = $('#browserAddonTokenText')
  var bookmarkletButton$ = $('#bookmarkletButton')
  var emailBookmarkletButton$ = $('#emailBookmarkletButton')
  var bookmarkletEmail$ = $('#bookmarkletEmail')
  var bookmarkletText$ = $('#bookmarkletText')
  var changeDBLocInput$ = $('#changeDBLocationInput')
  var changeDBLocButton$ = $('#changeDBLocationButton')
  var cancelSettingsButton$ = $('.cancelSettingsButton')
  var saveSettingsButtonButton$ = $('.saveSettingsButton')
  var dbLocationInfoTitle$ = $('#dbLocationInfoTitle')
  var importHTMLFileInput$ = $('#importHTMLFileInput')
  var importTextFileInput$ = $('#importTextFileInput')
  var importTextFileButton$ = $('#importTextFileButton')
  var importHTMLFileButton$ = $('#importHTMLFileButton')
  var exportHTMLFileButton$ = $('#exportHTMLFileButton')
  var exportTextFileButton$ = $('#exportTextFileButton')
  var revokeTokens$ = $('#revokeTokens')
  var csrfToken = $('#csrfInput').val()
  notieAlert$ = $('#notie-alert-outer')
  addPageUrlsDiv$ = $('.addPageUrls')
  addUrlsProgress$ = $('.addUrlsProgress')
  progressInfo$ = $('.progressInfo')
  progressBar$ = $('.progressBar')
  errorOKbutton$ = $('.errorOKbutton')

  $('.brandLogo').removeAttr()
  new Clipboard('.clipBoardButton')
  xhrHeaders = {
    'X-CSRF-Token': csrfToken
  }
  $('.addPageButtons').addClass('hide')
  addUrlsProgress$.removeClass('hide')
  progressInfo$.removeClass('hide')

  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }
  if(markSearchSettings.alwaysDisableTooltips){
    alwaysDisableTooltipsCheckbox$.prop('checked', true)
    alwaysDisableTooltipsCheckbox$.parent().addClass('checked')
  }
  //TODO set the bookmarkExpiryEnabled, bookmarkExpiryMonths on the page & bookmarkExpiryEmail (the elements valuse i mean)
  if(markSearchSettings.bookmarkExpiryEnabled){
    bookmarkExpiryCheckbox$.prop('checked', true)
    bookmarkExpiryCheckbox$.parent().addClass('checked')
  }
  //markSearchSettings.bookmarkExpiryMonths
  //markSearchSettings.bookmarkExpiryEnabled

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
        var errorMessage = getErrorMessage(err)
        showNotie(
          notieAlert$,
          'notie-alert-error',
          3,
          `There Was An Error Generating The Browser Extension Token.
           Error: ${errorMessage}`,
          6
        )
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
        var errorMessage = getErrorMessage(err)
        showNotie(
          notieAlert$,
          'notie-alert-error',
          3,
          `There Was An Error Generating The Bookmarklet.
           Error: ${errorMessage}`,
          6
        )
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
        showNotie(
          notieAlert$,
          'notie-alert-success',
          1,
          'Email Sent. (check your spam folder)',
          5
        )
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        showNotie(
          notieAlert$,
          'notie-alert-error',
          3,
          `There Was An Error Sending The Email.
           Error: ${errorMessage}`,
          6
        )
      })
  })

  /****
   * Change DB Location Folder
   */
  changeDBLocButton$.click(event => {
    event.preventDefault()
    changeDBLocInput$.click()
  })

  changeDBLocInput$.change(event => {
    var files = changeDBLocInput$[0].files
    if(!files.length) {
      return
    }
    dbLocationText$.text(files[0].path)
    /****
     * files[0].path only returns the path (with no trailing slash) so remove the filename and trailing
     * slash from the markSearchSettings.pagesDBFilePath when checking against dbLocationText$.text().
     */
    //TODO - double check the .slice(0, -19) works ok on windows & linux
    if(markSearchSettings.pagesDBFilePath.slice(0, -19) !== dbLocationText$.text().trim){
      dbLocationInfoTitle$.text('Database Will Be Moved To:')
    }
  })

  /****
   * Revoke Tokens
   */
  revokeTokens$.click( event => {
    event.preventDefault()
    got.post('/frontendapi/settings/revokeExtTokens', {headers: xhrHeaders})
      .then( () => {
        showNotie(
          notieAlert$,
          'notie-alert-success',
          1,
          'Tokens Successfully Revoked',
          5
        )
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        showNotie(
          notieAlert$,
          'notie-alert-error',
          3,
          `There Was An Error Revoking The Tokens.
           Error: ${errorMessage}`,
          6
        )
      })
  })

  /****
   * Importing Bookmarks From File
   */
  importHTMLFileButton$.click(event => {
    event.preventDefault()
    importHTMLFileInput$.click()
  })
  importHTMLFileInput$.change(importUrls)

  importTextFileButton$.click(event => {
    event.preventDefault()
    importTextFileInput$.click()
  })
  importTextFileInput$.change(importUrls)

  /****
   * OK Button On Importing Bookmarks Saving Error
   */
  errorOKbutton$.click(event => {
    hidePageSubbarAndReset()
  })

  /****
   * Export Bookmarks
   */

  exportHTMLFileButton$.click(event => {
    event.preventDefault()
    exportUrls('HTML')
  })

  exportTextFileButton$.click(event => {
    event.preventDefault()
    exportUrls('Text')
  })

  /****
   * Save Settings
   */
  saveSettingsButtonButton$.click( event => {
    event.preventDefault()
    var dbChangePromise = null
    var dbLocationText = dbLocationText$.text().trim()

    /****
     * dbLocationText only has the path (with no trailing slash) so remove the filename and trailing
     * slash from the markSearchSettings.pagesDBFilePath when checking against dbLocationText.
     */
    //TODO - double check the .slice(0, -19) works ok on windows & linux
    if(markSearchSettings.pagesDBFilePath.slice(0, -19) !== dbLocationText){
      dbChangePromise = got.post('/frontendapi/settings/changePagesDBlocation',
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

    Promise.resolve(dbChangePromise)
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
      .tap( settings =>
        got.post('/frontendapi/settings/update',
          {
            headers: xhrHeaders,
            body: settings
          }
        )
      )
      .then( settings => {
        showNotie(
          notieAlert$,
          'notie-alert-success',
          1,
          'Settings Saved',
          3
        )
        markSearchSettings = settings
        dbLocationInfoTitle$.text('Current Database Location:')
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        dbLocationInfoTitle$.text('Current Database Location:')
        showNotie(
          notieAlert$,
          'notie-alert-error',
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

export {
  xhrHeaders,
  addPageUrlsDiv$,
  progressBar$,
  errorOKbutton$,
  progressInfo$,
  addUrlsProgress$,
  notieAlert$
}