'use strict';

import { xhrHeaders } from './settingsPage'

import got from 'got'

function externalLinks(event){
  event.preventDefault()
  var linkHref = $(event.currentTarget).attr('href')
  if(linkHref.startsWith('/')){
    linkHref = 'http://' + window.location.host + linkHref
  }
  var urlToOpen = encodeURIComponent(linkHref)
  got.post(`/frontendapi/openUrlInBrowser/${urlToOpen}`, {headers: xhrHeaders})
    .catch(err =>{
      console.error(err)
    })
}

export { externalLinks }