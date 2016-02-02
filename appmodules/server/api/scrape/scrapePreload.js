
;(function(){
  var ipcRenderer = require('electron').ipcRenderer
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
       * Old way: Using innerText for documentText cause it excludes script and
       * style tags: http://mzl.la/1RSTO9T
       * I think I'm ok with not getting the text in elements that have
       * display:none or visibility: hidden
       * http://bit.ly/1KkKA3N
       *
       *
       *
       * New Way: Switching to textContent to get display:none or visibility: hidden
       * text as well - just gonna remove the script and style elements
       * before grab document.body.textContent so not including the text from those
       * script & style tags
       */
      var scriptAndStyleElems = document.querySelectorAll('body script, body style')
      for(var i = 0; i < scriptAndStyleElems.length; i++) {
        scriptAndStyleElems[i].remove()
      }
      var docDetails = {
        documentTitle: document.title,
        documentText: document.body.textContent,
        documentDescription: description
      }
      ipcRenderer.send('returnDocDetails', JSON.stringify(docDetails))
    }
    catch(err){
      ipcRenderer.send('returnDocDetailsError', JSON.stringify(err.message))
    }
  })
})()

