
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
       * For getting the text of the page:
       * Using textContent means the text from style and script tags are included
       * (could remove them though - e.g.: http://bit.ly/207Rds3). Also textContent
       * does not respect new lines created by <br> & block level elements
       * - e.g. <div>space</div>test1<div>test2</div>  - with textContent, the
       * returned text would be "spacetest1test2" - innerText is better in
       * that it returns "space\ntest1\ntest2", however innerText also is not that
       * great in general because it doesn't include text from elements that have
       * visibility:hidden or display:none styles.
       *
       * http://mzl.la/1RSTO9T
       * http://bit.ly/1KkKA3N
       *
       *
       * So gonna go with a bit of a hack of using window.getSelection(). Idea
       * from: http://bit.ly/207Qqaw
       *
       * The perf isn't that great but I dont think it will be noticably slow:
       * http://jsperf.com/innertext-vs-selection-tostring/5
       *
       * note: we collapse the whitespace later on (in addPage.js) which turns
       * \n into a space.
       */
      var selObj = window.getSelection()
      selObj.selectAllChildren(document.body)

      var docDetails = {
        documentTitle: document.title,
        documentText: selObj.toString(),
        documentDescription: description
      }
      ipcRenderer.send('returnDocDetails', JSON.stringify(docDetails))
    }
    catch(err){
      ipcRenderer.send('returnDocDetailsError', JSON.stringify(err.message))
    }
  })
})()

