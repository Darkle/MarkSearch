'use strict';

(function(){
  var ipcRenderer = require('electron').ipcRenderer
  //window.addEventListener('load', event => {
  //  ipcRenderer.send('asynchronous-message', 'ping')
  //}, false)
  ipcRenderer.on('sendDocDetails', function(event, arg) {
    try{
      var description = ''
      var descriptionElem = document.querySelector('meta[name="description"], meta[name="Description"], meta[name="DESCRIPTION"], meta[property="og:description"]')
      var keywordsElem = document.querySelector('meta[name="keywords"], meta[name="Keywords"], meta[name="KEYWORDS"], meta[property="og:keywords"]')
      if(descriptionElem && descriptionElem.hasAttribute('content')){
        description = descriptionElem.getAttribute('content')
      }
      /****
       * If there's no description for the page, fall back to using the
       * keywords if available
       */
      else if(keywordsElem && keywordsElem.hasAttribute('content')){
        description = keywordsElem.getAttribute('content')
      }
      /****
       * Using innerText for documentText cause it excludes script and
       * style tags: http://mzl.la/1RSTO9T
       */
      var docDetails = {
        documentTitle: document.title,
        documentText: document.body.innerText,
        documentDescription: description
      }
      ipcRenderer.send('returnDocDetails', JSON.stringify(docDetails))
    }
    catch(err){
      ipcRenderer.send('returnDocDetailsError', JSON.stringify(err.message))
    }
  })
})()

