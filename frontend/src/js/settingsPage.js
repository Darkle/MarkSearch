'use strict';

/* globals markSearchSettings, formplate, buttonplate, Clipboard  */

import "babel-polyfill" //needs to be first

import { generateBookmarkletJS } from './bookmarkletTemplate'

import got from 'got'
import notie from 'notie'
import _ from 'lodash'
import velocity from 'velocity-animate'
import suspend from 'suspend'

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

function coerceSettingsData(dataObj){
  return _.mapValues(dataObj, val => {
    if(val === 'false'){
      val = false
    }
    if(val === 'true'){
      val = true
    }
    return val
  })
}

function updateSettingsOnPage(settingsObj){
  settingsObj = coerceSettingsData(settingsObj)
  /****
   * Prebrowsing
   */
  if(settingsObj.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }
  markSearchSettings.prebrowsing = settingsObj.prebrowsing

  /****
   * Always Disable Tooltips
   */
  if(settingsObj.alwaysDisableTooltips){
    alwaysDisableTooltipsCheckbox$.prop('checked', true)
    alwaysDisableTooltipsCheckbox$.parent().addClass('checked')
  }
  markSearchSettings.alwaysDisableTooltips = settingsObj.alwaysDisableTooltips

  /****
   * Current Database Location
   */
  if(settingsObj.pagesDBFilePath){
    markSearchSettings.pagesDBFilePath = settingsObj.pagesDBFilePath
    /****
     * files[0].path only returns the path (with no trailing slash) so remove the filename and trailing
     * slash from the markSearchSettings.pagesDBFilePath
     */
    if(settingsObj.pagesDBFilePath.endsWith('MarkSearchPages.db')){
      markSearchSettings.pagesDBFilePath = settingsObj.pagesDBFilePath.slice(0, -19)
    }
    dbLocationText$.text(markSearchSettings.pagesDBFilePath)
  }

}

function showAddPageSubbar(){
  return $.Velocity(addPageUrlsDiv$[0], "slideDown", { duration: 500, display: 'flex' })
}

function hidePageSubbarAndReset(){
  $.Velocity(
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

function setFileReadErroProgressAndStartListeners(reader){
  reader.onloadstart = event => {
    progressBarContainerWidth = addUrlsProgress$.width()
    /****
     * Add a little bit of progress to show the user that it has started
     */
    $.Velocity.animate(
      progressBar$[0],
      {
        width: 20
      },
      500,
      'easeOutExpo'
    )
  }
  reader.onprogress = event => {
    progressBar$.velocity("stop")
    var animationDuration = event.loaded === event.total ? 0 : 500
    $.Velocity.animate(
      progressBar$[0],
      {
        width: (event.loaded/event.total) * progressBarContainerWidth
      },
      animationDuration,
      'easeOutSine'
    )
  }
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
  }
}

function saveUrls(urlsToSave){
  suspend(function*(urlsToSave){
    var urlsThatErrored = []
    var progressStepAmount = progressBarContainerWidth/urlsToSave.length
    var error
    progressBar$.velocity("stop")
    progressBar$.width(0)
    progressBar$.removeClass('hide')

    for(var i = 0; i < urlsToSave.length; i++) {
      progressInfo$.text(`Saving ${urlsToSave[i]}`)
      $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*(i+1))}, 5000, 'easeOutSine')
      var encodedUrl = encodeURIComponent(urlsToSave[i])
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
          url: urlsToSave[i],
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
      if(urlsThatErrored.length !== urlsToSave.length){
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
      }, 2500)
    }
  })(urlsToSave)
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
  var browserAddonTokenButton$ = $('#browserAddonTokenButton')
  var browserAddonTokenText$ = $('#browserAddonTokenText')
  var bookmarkletButton$ = $('#bookmarkletButton')
  var emailBookmarkletButton$ = $('#emailBookmarkletButton')
  var bookmarkletEmail$ = $('#bookmarkletEmail')
  var bookmarkletText$ = $('#bookmarkletText')
  //var dragAndDropDiv$ = $('#dragAndDrop')
  var changeDBLocInput$ = $('#changeDBLocationInput')
  var changeDBLocButton$ = $('#changeDBLocationButton')
  var cancelSettingsButton$ = $('.cancelSettingsButton')
  var saveSettingsButtonButton$ = $('.saveSettingsButton')
  var dbLocationInfoTitle$ = $('#dbLocationInfoTitle')
  var importHTMLFileInput$ = $('#importHTMLFileInput')
  var importTextFileInput$ = $('#importTextFileInput')
  var importTextFileButton$ = $('#importTextFileButton')
  var importHTMLFileButton$ = $('#importHTMLFileButton')

  $('.addPageButtons').addClass('hide')
  addUrlsProgress$.removeClass('hide')
  progressInfo$.removeClass('hide')


  updateSettingsOnPage(markSearchSettings)

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
      dbLocationText$.text(files[0].path)
      if(markSearchSettings.pagesDBFilePath !== _.trim(dbLocationText$.text())){
        dbLocationInfoTitle$.text('Database Will Be Moved To:')
      }
    }
  })
  /****
   * Importing URLs From File
   */
  importHTMLFileButton$.click(event => {
    event.preventDefault()
    importHTMLFileInput$.click()
  })

  importHTMLFileInput$.change(event => {
    var files = event.target.files
    if(files.length > 0){
      var file = files[0]
      var reader = new FileReader()
      setFileReadErroProgressAndStartListeners(reader)
      reader.onload = event => {
        progressInfo$.text(`Loaded ${file.name}`)
        var fileText = event.target.result
        var bookmarksDoc = document.implementation.createHTMLDocument('')
        bookmarksDoc.body.innerHTML = fileText
        var urlsToSave = _.map(bookmarksDoc.body.querySelectorAll('a'), element => {
          if(_.trim(element.href).length){
            return element.href
          }
        })
        saveUrls(urlsToSave)
      }
      showAddPageSubbar()
        .then(() => {
          progressInfo$.text(`Loading ${file.name}`)
          reader.readAsText(file)
        })
    }
  })

  importTextFileButton$.click(event => {
    event.preventDefault()
    importTextFileInput$.click()
  })

  importTextFileInput$.change(event => {
    var files = event.target.files
    if(files.length > 0){
      var file = files[0]
      var reader = new FileReader()
      setFileReadErroProgressAndStartListeners(reader)
      reader.onload = event => {
        progressInfo$.text(`Loaded ${file.name}`)
        var fileText = event.target.result
        var filteredLinesOfText = _.filter(fileText.split(/\r?\n/), lineValue => _.trim(lineValue).length)
        var urlsToSave = _.map(filteredLinesOfText, lineValue => {
          var a = document.createElement('a')
          a.href = lineValue
          var href = a.href
          a = null
          return href
        })
        saveUrls(urlsToSave)
      }
      showAddPageSubbar()
        .then(() => {
          progressInfo$.text(`Loading ${file.name}`)
          reader.readAsText(file)
        })
    }
  })

  /****
   * OK Button On Saving Error
   */
  errorOKbutton$.click(event => {
    hidePageSubbarAndReset()
  })

  /****
   * Save Settings
   */
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
        showNotie(
          notieAlert$,
          'notie-alert-success',
          1,
          'Settings Saved',
          3
        )
        updateSettingsOnPage(JSON.parse(response.body))
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
