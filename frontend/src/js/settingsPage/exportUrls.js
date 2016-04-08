'use strict';

import { xhrHeaders, notieAlert$ } from './settingsPage'
import { showNotie } from './showNotie'
import { getErrorMessage } from './getErrorMessage'

import netscape from 'netscape-bookmarks'
import got from 'got'
import _ from 'lodash'

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
      showNotie(3, `There Was An Error Exporting. Error: ${errorMessage}`, 6)
    })
}

export { exportUrls }