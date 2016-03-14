'use strict';

/* globals markSearchSettings, formplate, buttonplate, Clipboard  */

import "babel-polyfill" //needs to be first

import { generateBookmarkletJS } from './bookmarkletTemplate'

import got from 'got'
import notie from 'notie'
import _ from 'lodash'
import velocity from 'velocity-animate'
import suspend from 'suspend'
import netscape from 'netscape-bookmarks'
import Promise from 'bluebird'

var prebrowsingCheckbox$
var alwaysDisableTooltipsCheckbox$
var dbLocationText$
var notieAlert$
var addPageUrlsDiv$
var addUrlsProgress$
var progressInfo$
var progressBar$
var progressBarContainerWidth
var errorOKbutton$
var xhrHeaders
var bookmarkExpiryCheckbox$

function showNotie(notieElement, classToAdd, alertType, alertMessage, duration){
  notieElement.removeClass('notie-alert-success notie-alert-error')
  notieElement.addClass(classToAdd)
  notie.alert(alertType, alertMessage, duration)
}

function getErrorMessage(err){
  var errorMessage = _.get(err, 'message')
  var responseBody = _.trim(_.get(err, 'response.body'))
  var parsedResponseBody
  if(responseBody.length){
    try{
      parsedResponseBody = JSON.parse(responseBody)
    }
    catch(e){}
  }
  if(_.get(parsedResponseBody, 'errorMessage')){
    errorMessage = parsedResponseBody.errorMessage
  }
  return errorMessage
}

function updateSettingsOnPage(){
  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }
  if(markSearchSettings.alwaysDisableTooltips){
    alwaysDisableTooltipsCheckbox$.prop('checked', true)
    alwaysDisableTooltipsCheckbox$.parent().addClass('checked')
  }
  dbLocationText$.text(markSearchSettings.pagesDBFilePath)
  //TODO set the bookmarkExpiryEnabled, bookmarkExpiryMonths on the page & bookmarkExpiryEmail (the elements valuse i mean)
  if(markSearchSettings.bookmarkExpiryEnabled){
    bookmarkExpiryCheckbox$.prop('checked', true)
    bookmarkExpiryCheckbox$.parent().addClass('checked')
  }
  //markSearchSettings.bookmarkExpiryMonths
  //markSearchSettings.bookmarkExpiryEnabled
}

function pagesDBFilePathSansTrailingSlashAndFileName(pagesDBFilePath){
  //TODO - double check the trailing slash (here and on checking text value at bottom) is
  // there on Windows and this code works ok
  if(pagesDBFilePath.endsWith('MarkSearchPages.db')){
    pagesDBFilePath = pagesDBFilePath.slice(0, -19)
  }
  return pagesDBFilePath
}

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

/****
 * @param urlsToSave - Set()
 */
function saveUrls(urlsToSave){
  suspend(function*(urlsToSave){
    var urlsThatErrored = []
    var progressStepAmount = progressBarContainerWidth/urlsToSave.size
    var error
    var index = 0
    progressBar$.velocity("stop")
    progressBar$.width(0)
    progressBar$.removeClass('hide')

    for(var url of urlsToSave) {
      progressInfo$.text(`Saving ${url}`)
      $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*(index+1))}, 4000, 'easeInOutCubic')
      index = index + 1
      var encodedUrl = encodeURIComponent(url)
      try{
        yield got.post(`/frontendapi/scrapeAndAdd/${encodedUrl}`, {headers: xhrHeaders})
      }
      catch(err){
        console.error(err)
        error = err
        var errMessage = _.get(error, 'response.body') || ''
        if(errMessage){
          errMessage = JSON.parse(errMessage).errorMessage
        }
        urlsThatErrored.push({
          url: url,
          errMessage: errMessage
        })
      }
    }
    if(error){
      progressBar$.velocity("stop")
      progressBar$.width(progressBarContainerWidth)
      progressInfo$.text(``)
      progressInfo$.css(`overflow-y`, `scroll`)
      errorOKbutton$.width(progressBarContainerWidth)
      errorOKbutton$.removeClass('hide')
      progressBar$.addClass('hide')
      var ul$ = $('<ul>')
      var errorTextBeginning = ``
      if(urlsThatErrored.length !== urlsToSave.size){
        errorTextBeginning = `Most URLs Saved, However `
      }
      $(`<li>${errorTextBeginning}Errors Occured While Saving The Following URLs:</li>`).appendTo(ul$)
      for(var errUrl of urlsThatErrored){
        $(`<li>${errUrl.url} - reason: ${errUrl.errMessage}</li>`).appendTo(ul$)
      }
      progressInfo$.append(ul$)
    }
    else{
      progressBar$.velocity("stop")
      $.Velocity.animate(progressBar$[0], {width: progressBarContainerWidth}, 10, 'easeOutExpo')
      progressInfo$.text(`All URLs Saved`)
      window.setTimeout(ev => {
        hidePageSubbarAndReset()
      }, 3500)
    }
  })(urlsToSave)
}

function importUrls(event){
  var eventElement = event.target
  var files = eventElement.files
  if(files.length > 0){
    var file = files[0]
    var reader = new FileReader()
    /****
     * .path is available in Electron.
     * http://electron.atom.io/docs/all/#file-object
     */
    reader.onload = event => {
      got.post(
        `/frontendapi/settings/checkIfFileIsBinary/${encodeURIComponent(file.path)}`,
        {
          headers: xhrHeaders
        }
      )
      .then( response => {
        //progressInfo$.text(`Loaded ${file.name}`)
        var fileText = event.target.result
        var urlsToSave = []
        if(eventElement.dataset.importType === 'html'){
          var bookmarksDoc = document.implementation.createHTMLDocument('')
          bookmarksDoc.body.innerHTML = fileText
          urlsToSave = _.map(bookmarksDoc.body.querySelectorAll('a'), element =>{
            if(_.trim(element.href).length){
              return element.href
            }
          })
        }
        else{
          var filteredLinesOfText = _.filter(fileText.split(/\r?\n/), lineValue => _.trim(lineValue).length)
          _.each(filteredLinesOfText, lineValue =>{
            var a = document.createElement('a')
            a.href = lineValue
            /****
             * If the text is not a url, then a.href = lineValue results in lineValue being appended
             * to the current base url in the window and saved as that. Also check against empty stuff.
             * Leave a.hostname.length check in there.
             * Null the a element in case we are creating 1000s
             */
            if(a.href.length && a.hostname.length && a.hostname !== window.location.hostname){
              var href = a.href
              a = null
              urlsToSave.push(href)
            }
            else{
              a = null
            }
          })
        }
        if(!urlsToSave.length){
          showNotie(
            notieAlert$,
            'notie-alert-error',
            3,
            `Error: No URLs Were Found In The File.`,
            6
          )
        }
        else{
          var deDupedUrlsToSave = new Set(urlsToSave)
          saveUrls(deDupedUrlsToSave)
        }
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
        hidePageSubbarAndReset()
          .then(() => {
            showNotie(
              notieAlert$,
              'notie-alert-error',
              3,
              `There Was An Error Opening The File.
                    Error: ${errorMessage}`,
              6
            )
          })
      })
      reader.onerror = event => {
      console.error(event)
      console.error(reader.error)
      showNotie(
        notieAlert$,
        'notie-alert-error',
        3,
        `There Was An Error Loading The File.
          Error: ${reader.error.name}`,
        6
      )
      reader.abort()
    }  }

    showAddPageSubbar()
      .then(() => {
        progressBarContainerWidth = addUrlsProgress$.width()
        //progressInfo$.text(`Loading ${file.name}`)
        reader.readAsText(file)
      })
  }
}

function exportUrls(typeOfExport){
  got.post('/frontendapi/getall/', {headers: xhrHeaders})
    .then( response => {
      var rows = JSON.parse(response.body)
      var downloadUrl
      var blobData = ''
      var fileExtension = 'html'

      var downloadLink = document.createElement("a")
      document.body.appendChild(downloadLink)
      downloadLink.setAttribute('style', "display: none")

      if(typeOfExport === 'HTML'){
        var bookmarks = {
          "MarkSearch Bookmarks": {
            "contents": {}
          }
        }
        _.each(rows, pageData => {
          /****
           * If there's no pageTitle, then use the pageDomain with a random number
           * string attached to make it unique.
           */
          if(!pageData.pageTitle || !_.trim(pageData.pageTitle).length){
            pageData.pageTitle = pageData.pageDomain + _.random(0, 1000000)
          }
          bookmarks["MarkSearch Bookmarks"].contents[pageData.pageTitle] = pageData.pageUrl
        })
        blobData = netscape(bookmarks)
      }
      else{
        fileExtension = 'txt'
        _.each(rows, pageData => {
          blobData = blobData + pageData.pageUrl + '\n'
        })
      }
      var blob = new Blob([blobData], {type : 'text/html'} )
      downloadUrl = window.URL.createObjectURL(blob)
      downloadLink.href = downloadUrl
      downloadLink.download = `MarkSearchExport.${fileExtension}`
      downloadLink.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(downloadLink)
    })
    .catch(err =>{
      console.error(err)
      var errorMessage = getErrorMessage(err)
      showNotie(
        notieAlert$,
        'notie-alert-error',
        3,
        `There Was An Error Exporting.
          Error: ${errorMessage}`,
        6
      )
    })
}

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  var csrfToken = $('#csrfInput').val()
  $('.brandLogo').removeAttr()
  formplate($('body'))
  buttonplate($('.button'))
  new Clipboard('.clipBoardButton')
  xhrHeaders = {
    'X-CSRF-Token': csrfToken
  }

  /****
   * formplate moves things around, so grab elements after its
   * done its thing
   */
  prebrowsingCheckbox$ = $('#prebrowsingCheckbox')
  alwaysDisableTooltipsCheckbox$ = $('#alwaysDisableTooltipsCheckbox')
  dbLocationText$ = $('.dbLocationContainer .locationText')
  notieAlert$ = $('#notie-alert-outer')
  addPageUrlsDiv$ = $('.addPageUrls')
  addUrlsProgress$ = $('.addUrlsProgress')
  progressInfo$ = $('.progressInfo')
  progressBar$ = $('.progressBar')
  errorOKbutton$ = $('.errorOKbutton')
  bookmarkExpiryCheckbox$ = $('#bookmarkExpiryCheckbox')
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

  $('.addPageButtons').addClass('hide')
  addUrlsProgress$.removeClass('hide')
  progressInfo$.removeClass('hide')


  updateSettingsOnPage()

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
    if(files.length > 0){
      /****
       * files[0].path only returns the path (with no trailing slash) so remove the filename and trailing
       * slash from the markSearchSettings.pagesDBFilePath when checking against dbLocationText$.text().
       */
      dbLocationText$.text(files[0].path)
      var pagesDBFilePathSansTrailingSlashAndFileName = pagesDBFilePathSansTrailingSlashAndFileName(markSearchSettings.pagesDBFilePath)
      if(pagesDBFilePathSansTrailingSlashAndFileName !== _.trim(dbLocationText$.text())){
        dbLocationInfoTitle$.text('Database Will Be Moved To:')
      }
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
    var dbLocationText = _.trim(dbLocationText$.text())
    var pagesDBFilePathSansTrailingSlashAndFileName = pagesDBFilePathSansTrailingSlashAndFileName(markSearchSettings.pagesDBFilePath)

    if(pagesDBFilePathSansTrailingSlashAndFileName !== dbLocationText){
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
        updateSettingsOnPage()
      })
      .catch( err => {
        console.error(err)
        var errorMessage = getErrorMessage(err)
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