'use strict';

var electron = require('electron')

module.exports = function () {
  console.log('webviewScript running')
  //electron.ipcRenderer.on('load-url', function (event, url) {
  //  var webview = domify('<webview src="' + url + '" preload="./webview.js"></webview>')
  //  document.body.innerHTML = ''
  //  document.body.appendChild(webview)
  //  webview.addEventListener('will-navigate', function (newUrl) {
  //    electron.ipcRenderer.send('webview-event', 'will-navigate', newUrl)
  //  })
  //  webview.addEventListener('did-finish-load', function () {
  //    electron.ipcRenderer.send('webview-event', 'did-finish-load')
  //    electron.ipcRenderer.send('webview-did-finish-load')
  //  })
  //  webview.addEventListener('did-fail-load', function (error) {
  //    electron.ipcRenderer.send('webview-event', 'did-fail-load', error)
  //    electron.ipcRenderer.send('webview-did-finish-load', error)
  //  })
  //  webview.addEventListener('did-start-loading', function () {
  //    electron.ipcRenderer.send('webview-event', 'did-start-loading')
  //  })
  //  webview.addEventListener('did-stop-loading', function () {
  //    electron.ipcRenderer.send('webview-event', 'did-stop-loading')
  //  })
  //})

  //TODO - make sure I remove all ipc listeners on finished: http://bit.ly/218oSrx - debug it and see if there is a removeAllListeners available
  //TODO - make sure to null everything on finished

  electron.ipcRenderer.on('createAndLoadWebview', function (event, id, urlToScrape) {
    console.log(`electron.ipcRenderer.on('run'`)
    console.log(event)
    console.log(id)
    console.log(urlToScrape)
    var webview = document.createElement('webview')
    webview.setAttribute('src', urlToScrape)
    webview.setAttribute('preload', './webviewPreload.js')

    //var webview = document.querySelector('webview')
    //webview.addEventListener('ipc-message', onIPC)
    //
    //function onIPC (event) {
    //  electron.ipcRenderer.send.apply(null, [id + '-' + event.channel].concat(event.args))
    //  if (event.channel === 'done-running') {
    //    webview.removeEventListener('ipc-message', onIPC)
    //  }
    //}
    //
    //webview.executeJavaScript(ipcWrap(code))
  })
}