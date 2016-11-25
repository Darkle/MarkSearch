'use strict'

import { xhrHeaders } from './settingsPage'
import { showNotie } from './showNotie'
import { getErrorMessage } from './getErrorMessage'

import netscape from 'netscape-bookmarks'
import axios from 'axios'
import _ from 'lodash'

function exportUrls(typeOfExport) {
  axios
    .post('/frontendapi/getall/', null, {headers: xhrHeaders})
    .then( response => {
      console.log('exportUrls axios response', response)
      var rows = response.data
      var downloadUrl
      var blobData = ''
      var fileExtension = 'html'

      var downloadLink = document.createElement("a")
      document.body.appendChild(downloadLink)
      downloadLink.setAttribute('class', 'hide')

      if(typeOfExport === 'HTML'){
        var bookmarks = {
          "MarkSearch Bookmarks": {
            "contents": {}
          }
        }
        _.each(rows, pageData => {
          /****
           * If there's no pageTitle, then use the pageUrl as the title.
           */
          if(!pageData.pageTitle || !_.trim(pageData.pageTitle).length){
            pageData.pageTitle = pageData.pageUrl
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
      var blob = new Blob([blobData], {type: 'text/html'} )
      downloadUrl = window.URL.createObjectURL(blob)
      downloadLink.href = downloadUrl
      downloadLink.download = `MarkSearchExport.${ fileExtension }`
      downloadLink.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(downloadLink)
    })
    .catch(err => {
      console.error(err)
      var errorMessage = getErrorMessage(err)
      showNotie(3, `There Was An Error Exporting. Error: ${ errorMessage }`, 6)
    })
}

export { exportUrls }
