'use strict'

var electron = require('electron')
var url = require('url')

var ipcRenderer = electron.ipcRenderer
var numTimesRedirected = 0
var haveAskedForPageData = false
var domReadyFired = false
var webview
var urlToScrape

function removeWebview() {
  if(!webview){
    webview = document.querySelector('webview')
  }
  if(webview){
    webview.removeEventListener('did-start-loading', didStartLoadListener)
    webview.removeEventListener('dom-ready', domReadyListener)
    webview.removeEventListener('did-finish-load', didFinishLoadListener)
    webview.removeEventListener('did-fail-load', didFailLoadListener)
    webview.removeEventListener('did-get-redirect-request', didGetRedirectRequestListener)
    webview.removeEventListener('crashed', crashedListener)
    webview.removeEventListener('gpu-crashed', gpuCrashedListener)
    webview.removeEventListener('ipc-message', ipcMessageListener)
    document.body.removeChild(webview)
  }
  webview = null
  numTimesRedirected = 0
  haveAskedForPageData = false
  domReadyFired = false
  urlToScrape = null
}

function sendErrorToMainProcess(data) {
  removeWebview()
  ipcRenderer.send('webview-error', JSON.stringify(data))
}

function sendLogToMainProcess(data) { // eslint-disable-line
  ipcRenderer.send('webview-log', JSON.stringify(data))
}

/****
 * A check in case there is a site that is online but just takes
 * forever and never seems to load properly
 */
function didStartLoadListener() {
  setTimeout( () => {
    if(!domReadyFired){
      sendErrorToMainProcess(`webview: load timeout`)
      removeWebview()
    }
  }, 20000)
}

/****
 * Cant set webview.setAudioMuted(true) until dom-ready.
 *
 * Sometimes the 'did-finish-load' (aka onload) below doesn't fire,
 * so using a setTimeout here in the 'dom-ready' (aka ondomcontentloaded)
 * event listener as a backup. It could be it doesn't fire because of an
 * image/object taking forever to load.
 */
function domReadyListener() {

  domReadyFired = true
  webview.setAudioMuted(true)
  setTimeout( () => {
    if(!haveAskedForPageData){
      haveAskedForPageData = true
      webview.send('sendPageData')
    }
  }, 7000)
}

/****
 * 'did-finish-load' fires when the onload event was dispatched
 * note: 'did-finish-load' fires at the end of all 'did-get-redirect-request'
 * events
 */
function didFinishLoadListener() {
  /****
   * Ask webviewPreload.js to send back the page data
   */
  if(!haveAskedForPageData){
    haveAskedForPageData = true
    webview.send('sendPageData')
  }
}

function didFailLoadListener() {
  if(event.validatedURL === urlToScrape){
    //sendErrorToMainProcess(`
    //  webview: did-fail-load
    //  errorCode: ${event.errorCode}
    //  errorDescription: ${event.errorDescription}
    //  validatedURL: ${event.validatedURL}
    //  urlToScrape: ${urlToScrape}
    //`)
    sendErrorToMainProcess(`webview: did-fail-load`)
    removeWebview()
  }
}

/****
 * 'did-get-redirect-request' will fire on any resource on the page that
 * is redirected, so only update the urlToScrape when its the the webview url
 * being redirected.
 */
function didGetRedirectRequestListener() {
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
      sendErrorToMainProcess('webview: possible infinite redirect loop')
      removeWebview()
    }
  }
}

function crashedListener() {
  sendErrorToMainProcess(`webview: crashed`)
  removeWebview()
}

function gpuCrashedListener() {
  sendErrorToMainProcess(`webview: crashed`)
  removeWebview()
}

function ipcMessageListener() {
  if(event.channel === 'returnDocDetails'){
    /****
     * Send back the updated urlToScrape in the case of it being redirected
     */
    event.args[0].pageUrl = urlToScrape
    ipcRenderer.send('returnDocDetails', JSON.stringify(event.args[0]))
  }
  else if(event.channel === 'returnDocDetailsError'){
    sendErrorToMainProcess(`webviewPreload error: ${ event.args }`)
  }
  removeWebview()
}

module.exports = function() {

  ipcRenderer.on('createAndLoadWebview', (event, sentUrlToScrape) => {
    removeWebview()

    urlToScrape = sentUrlToScrape

    webview = document.createElement('webview')
    webview.setAttribute('src', urlToScrape)
    webview.setAttribute('style', 'width:100%;height:100%;')
    webview.setAttribute('preload', './webviewPreload.js')

    webview.addEventListener('did-start-loading', didStartLoadListener)
    webview.addEventListener('dom-ready', domReadyListener)
    webview.addEventListener('did-finish-load', didFinishLoadListener)
    webview.addEventListener('did-fail-load', didFailLoadListener)
    webview.addEventListener('did-get-redirect-request', didGetRedirectRequestListener)
    webview.addEventListener('crashed', crashedListener)
    webview.addEventListener('gpu-crashed', gpuCrashedListener)
    webview.addEventListener('ipc-message', ipcMessageListener)

    document.body.appendChild(webview)
  })
}
