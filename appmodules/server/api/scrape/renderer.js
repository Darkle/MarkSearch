'use strict';

var electron = require('electron')
var url = require('url')

var ipcRenderer = electron.ipcRenderer

function removeWebview(webViewElem){
  document.body.removeChild(webViewElem)
}

function sendErrorToMainProcess(data){
  ipcRenderer.send('webview-error', JSON.stringify(data))
}

function sendLogToMainProcess(data){
  ipcRenderer.send('webview-log', JSON.stringify(data))
}

module.exports = function () {

  ipcRenderer.on('createAndLoadWebview', (event, urlToScrape) => {

    var numTimesRedirected = 0

    var webview = document.createElement('webview')
    webview.setAttribute('src', urlToScrape)
    webview.setAttribute('preload', './webviewPreload.js')

    var oldwebview = document.querySelector('webview')
    if(oldwebview){
      removeWebview(oldwebview)
      oldwebview = null
    }

    /****
     * Cant set webview.setAudioMuted(true) until dom-ready
     */
    webview.addEventListener('dom-ready', event => {
      webview.setAudioMuted(true)
    })
    /****
     * 'did-finish-load' fires when the onload event was dispatched
     * note: 'did-finish-load' fires at the end of all 'did-get-redirect-request'
     * events
     */
    webview.addEventListener('did-finish-load', event => {
      /****
       * Ask webviewPreload.js to send back the page data
       */
      webview.send('sendPageData')
    })

    webview.addEventListener('did-fail-load', event => {
      if(event.validatedURL === urlToScrape){
        sendErrorToMainProcess(`
          webview: did-fail-load
          errorCode: ${event.errorCode}
          errorDescription: ${event.errorDescription}
          validatedURL: ${event.validatedURL}
          urlToScrape: ${urlToScrape}
        `)
        removeWebview(webview)
        webview = null
      }
    })
    webview.addEventListener('crashed', event => {
      sendErrorToMainProcess(`webview: crashed on url ${event.srcElement.src}`)
      removeWebview(webview)
      webview = null
    })
    /****
     * 'did-get-redirect-request' will fire on any resource on the page that
     * is redirected, so only update the urlToScrape when its the the webview url
     * being redirected.
     */
    webview.addEventListener('did-get-redirect-request', event => {
      if(event.isMainFrame){
        /****
         * Update the urlToScrape to the new redirected location so we can
         * save the url it ends on.
         * (Using url.parse to add a trailing slash just in case).
         */
        urlToScrape = url.parse(event.newURL).href
        /****
         * So we dont get into an infinite redirect loop.
         */
        numTimesRedirected = numTimesRedirected + 1
        if(numTimesRedirected > 5){
          sendErrorToMainProcess('webview: infinite redirect loop')
          removeWebview(webview)
          webview = null
        }
      }
    })
    webview.addEventListener('ipc-message', event => {
      if(event.channel === 'returnDocDetails'){
        /****
         * Send back the updated urlToScrape in the case of it being redirected
         */
        event.args[0].pageUrl = urlToScrape
        ipcRenderer.send('returnDocDetails', JSON.stringify(event.args[0]))
      }
      else if(event.channel === 'returnDocDetailsError'){
        sendErrorToMainProcess(`webviewPreload error: ${JSON.stringify(event.args)}`)
      }
      removeWebview(webview)
      webview = null
    })
    document.body.appendChild(webview)
  })
}