'use strict';

import "babel-polyfill"

import { generateBookmarkletJS } from '../bookmarkletTemplate'

import got from 'got'

$(document).ready(bookmarkletPageInit)

function bookmarkletPageInit(event){
  var csrfToken = $('#csrfInput').val()
  var xhrHeaders = {
    'X-CSRF-Token': csrfToken
  }

  got.post('/frontendapi/settings/generateExtToken/', {headers: xhrHeaders})
    .then( response => {
      var responseData = JSON.parse(response.body)
      var bookmarkletJS = generateBookmarkletJS(responseData.protocolIpandPort, responseData.token)
      $('#bookmarkletLink').attr('href', `javascript:${encodeURIComponent(bookmarkletJS)}`)
    })
    .catch( err => {
      console.error(err)
    })
}
