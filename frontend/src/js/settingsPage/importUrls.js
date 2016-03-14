'use strict';

import { xhrHeaders, notieAlert$ } from './settingsPage'
import { showAddPageSubbar, hidePageSubbarAndReset } from './hideShowAddPageSubbar'
import { showNotie } from './showNotie'
import { saveUrls } from './saveUrls'
import { getErrorMessage } from './getErrorMessage'

import got from 'got'
import _ from 'lodash'

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





