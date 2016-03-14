'use strict';

import { xhrHeaders, notieAlert$ } from './settingsPage'
import { showAddPageSubbar, hidePageSubbarAndReset } from './hideShowAddPageSubbar'
import { showNotie } from './showNotie'
import { saveUrls } from './saveUrls'
import { getErrorMessage } from './getErrorMessage'

import got from 'got'
import _ from 'lodash'
import validUrl from 'valid-url'

function importUrls(event){
  var eventElement = event.target
  var files = eventElement.files
  if(!files.length){
    return
  }
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
      var arrayOfUrls
      if(eventElement.dataset.importType === 'html'){
        var bookmarksDoc = document.implementation.createHTMLDocument('')
        bookmarksDoc.body.innerHTML = fileText
        var allAelements = bookmarksDoc.body.querySelectorAll('a')
        arrayOfUrls = _.map(allAelements, element => element.href)
      }
      else{
        arrayOfUrls = fileText.split(/\r?\n/)
      }
      urlsToSave = _.filter(
        arrayOfUrls,
        lineValue => _.trim(lineValue).length && validUrl.isWebUri(lineValue)
      )
      if(!urlsToSave.length){
        showNotie('notie-alert-error', 3, `Error: No URLs Were Found In The File.`, 6)
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
      //progressInfo$.text(`Loading ${file.name}`)
      reader.readAsText(file)
    })
}

export { importUrls }





