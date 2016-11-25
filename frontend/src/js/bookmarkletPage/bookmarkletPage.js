'use strict'

import "babel-polyfill"

import { generateBookmarkletJS } from '../bookmarkletTemplate'

import axios from 'axios'

$(document).ready(bookmarkletPageInit)

function bookmarkletPageInit() {
  var csrfToken = $('#csrfInput').val()
  var xhrHeaders = {
    'X-CSRF-Token': csrfToken
  }

  axios
    .post('/frontendapi/settings/generateExtToken/', null, {headers: xhrHeaders})
    .then( response => {
      var responseData = response.data
      var bookmarkletJS = generateBookmarkletJS(responseData.protocolIpandPort, responseData.token)
      $('#bookmarkletLink').attr('href', `javascript:${ encodeURIComponent(bookmarkletJS) }`)
    })
    .catch( err => {
      console.error(err)
    })
}
