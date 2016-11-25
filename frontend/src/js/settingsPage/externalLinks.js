'use strict'

import { xhrHeaders } from './settingsPage'

import axios from 'axios'

function externalLinks(event) {
  event.preventDefault()
  var linkHref = $(event.currentTarget).attr('href')
  if(linkHref.startsWith('/')){
    linkHref = 'http://' + window.location.host + linkHref
  }
  var urlToOpen = encodeURIComponent(linkHref)
  axios
    .post(`/frontendapi/openUrlInBrowser/${ urlToOpen }`, null, {headers: xhrHeaders})
    .catch(err => {
      console.error(err)
    })
}

export { externalLinks }
