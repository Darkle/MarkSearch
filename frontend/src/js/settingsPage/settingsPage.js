'use strict';

/* globals markSearchSettings: true, Clipboard, formplate, buttonplate  */

import "babel-polyfill"
import { generateBookmarkletJS } from '../bookmarkletTemplate'
import { showNotie } from './showNotie'
import { getErrorMessage } from './getErrorMessage'
import { importUrls } from './importUrls'
import { exportUrls } from './exportUrls'
import { hidePageSubbarAndReset } from './hideShowAddPageSubbar'
import { setSettingsElementValues } from './setSettingsElementValues'
import { externalLinks } from './externalLinks'

import got from 'got'
import Promise from 'bluebird'

var xhrHeaders
var addPageUrlsDiv$
var progressBar$
var errorOKbutton$
var progressInfo$
var addUrlsProgress$
var notieAlert$
var dbLocationInfoTitle$
var prebrowsingCheckbox$
var alwaysDisableTooltipsCheckbox$
var bookmarkExpiryCheckbox$
var bookmarkExpiryEmail$
var bookmarkExpirySelectMonths$
var dbLocationText$

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  var body$ = $('body')
  window.markSearchSettings = body$.data('marksearchSettings')
  formplate(body$)
  buttonplate($('.button'))
  /****
   * formplate moves things around, so grab elements only after its
   * done its thing
   */
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
  var importHTMLFileInput$ = $('#importHTMLFileInput')
  var importTextFileInput$ = $('#importTextFileInput')
  var importTextFileButton$ = $('#importTextFileButton')
  var importHTMLFileButton$ = $('#importHTMLFileButton')
  var exportHTMLFileButton$ = $('#exportHTMLFileButton')
  var exportTextFileButton$ = $('#exportTextFileButton')
  var revokeTokens$ = $('#revokeTokens')
  dbLocationText$ = $('.dbLocationContainer .locationText')
  bookmarkExpiryCheckbox$ = $('#bookmarkExpiryCheckbox')
  bookmarkExpiryEmail$ = $('#bookmarkExpiryEmail')
  bookmarkExpirySelectMonths$ = $('#bookmarkExpirySelect')
  alwaysDisableTooltipsCheckbox$ = $('#alwaysDisableTooltipsCheckbox')
  prebrowsingCheckbox$ = $('#prebrowsingCheckbox')
  dbLocationInfoTitle$ = $('#dbLocationInfoTitle')
  notieAlert$ = $('#notie-alert-outer')
  addPageUrlsDiv$ = $('.addPageUrls')
  addUrlsProgress$ = $('.addUrlsProgress')
  progressInfo$ = $('.progressInfo')
  progressBar$ = $('.progressBar')
  errorOKbutton$ = $('.errorOKbutton')

  var csrfToken = $('#csrfInput').val()
  $('.brandLogo a').removeAttr('href')
  new Clipboard('.clipBoardButton')
  xhrHeaders = {
    'X-CSRF-Token': csrfToken
  }
  $('.addPageButtons').addClass('hide')
  addUrlsProgress$.removeClass('hide')
  progressInfo$.removeClass('hide')

  setSettingsElementValues()

  /****
   * External links
   */
  $('.externalLink').click(externalLinks)

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
        showNotie(3, `There Was An Error Generating The Browser Extension Token. Error: ${errorMessage}`, 6)
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
        showNotie(3, `There Was An Error Generating The Bookmarklet. Error: ${errorMessage}`, 6)
      })
  })
  /****
   * Email bookmarklet
   *
   * (we do validation of the email server side)
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
              email: bookmarkletEmail,
              bookmarkletText: generatedBookmarkletText
            }
          }
        )
      })
      .then(response => {
        showNotie(1, 'Email Sent. (check your spam folder)', 5)
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        showNotie(3, `There Was An Error Sending The Email. Error: ${errorMessage}`, 6)
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
     * files[0].path only returns the path (with no trailing slash or filename) so remove the filename and trailing
     * slash from the markSearchSettings.pagesDBFilePath when checking against dbLocationText$.text().
     * (.path is available in Electron.)
     */
    //TODO - double check the .slice(0, -19) works ok on windows & linux
    //TODO - also check files[0].path doesnt have a trailing slash on windows & linux
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
        showNotie(1, 'Tokens Successfully Revoked', 5)
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        showNotie(3, `There Was An Error Revoking The Tokens. Error: ${errorMessage}`, 6)
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
     * dbLocationText only has the path (with no trailing slash or filename) so remove the
     * filename and trailing slash from the markSearchSettings.pagesDBFilePath when
     * checking against dbLocationText.
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
        .then(response =>
          JSON.parse(response.body).newPagesDBFilePath
        )
    }
    /****
     * note: for the bookmark expiry, the bookmarkExpiry.init minimal check is always running,
     * so don't need to init/change anything, it will just check the settings every 3 hours
     * and if enabled, run, and then get the email/months dynamically from the appSettings.settings.
     *
     * Using Promise.try rather than Promise.resolve to guard against exceptions.
     * note: Promise.try(got.post()) aka Promise.try(dbChangePromise) doesn't seem to work, so
     * return got.post() aka dbChangePromise inside a function in the .try().
     */

    Promise
      .try(() => dbChangePromise)
      .then( newPagesDBFilePath => {
        var newSettings = {
          prebrowsing: prebrowsingCheckbox$[0].checked,
          alwaysDisableTooltips: alwaysDisableTooltipsCheckbox$[0].checked,
          bookmarkExpiryEnabled: bookmarkExpiryCheckbox$[0].checked,
          bookmarkExpiryMonths: parseInt(bookmarkExpirySelectMonths$.val()),
          bookmarkExpiryEmail: bookmarkExpiryEmail$.val()
        }
        newSettings.pagesDBFilePath = newPagesDBFilePath || markSearchSettings.pagesDBFilePath
        return newSettings
      })
      .tap( newSettings => got.post('/frontendapi/settings/update', {headers: xhrHeaders, body: newSettings})
      )
      .then( newSettings => {
        showNotie(1, 'Settings Saved', 3)
        dbLocationInfoTitle$.text('Current Database Location:')
        markSearchSettings = newSettings
      })
      .catch(err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        /****
         * Put the settings element values back to what they were before
         * the user tried to save.
         */
        setSettingsElementValues()
        showNotie(3,`There Was An Error Saving The Settings. Error: ${errorMessage}`, 6)
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
  notieAlert$,
  dbLocationInfoTitle$,
  prebrowsingCheckbox$,
  alwaysDisableTooltipsCheckbox$,
  bookmarkExpiryCheckbox$,
  bookmarkExpiryEmail$,
  bookmarkExpirySelectMonths$,
  dbLocationText$
}
