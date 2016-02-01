'use strict';

var path = require('path')
var fs = require('fs')

var debug = require('debug')('MarkSearch:scrapeAndAddPage')
var electron = require('electron')
var BrowserWindow = electron.BrowserWindow
var ipcMain = electron.ipcMain

var collapseWhitespace = require(path.join(__dirname, '..', '..', '..', 'utils', 'collapseWhitespace')) //TODO remove this
var addPage = require(path.join(__dirname, '..', 'addPage'))


/****
 * Check the resources here (down bottom) on innerText
  * http://caniuse.com/#feat=innertext
 * And also this post: http://perfectionkills.com/the-poor-misunderstood-innerText/
 */

/****
 * https://samsaffron.com/archive/2012/06/07/testing-3-million-hyperlinks-lessons-learned
 */



/****
 * A generator on the front end is calling scrapeAndAddPage, so
 * shouldn't have any issues with req, res, next etc. being overwritten
 * by subsequent calls while event listeners are still running
 */
function scrapeAndAddPage(req, res, next) {
  debug('scrapeAndAddPage running')

  var urlToScrape = req.params.pageUrl
  var devMode = req.app.get('env') === 'development'

  var browserWindow = new BrowserWindow(
      {
        show: devMode,
        preload: path.join(__dirname, 'scrapePreload.js'),
        webPreferences: {
          nodeIntegration: false,
          allowDisplayingInsecureContent: true,
          allowRunningInsecureContent: true
        }
      }
  )
  browserWindow.on('closed', () => {
    debug('browserWindow: closed')
    browserWindow = null
    webContents = null
    ipcMain.removeAllListeners('returnDocDetails')
    ipcMain.removeAllListeners('returnDocDetailsError')
  })
  browserWindow.on('unresponsive', () => {
    debug('BrowserWindow: unresponsive')
    res.status(500).json({errorMessage: 'BrowserWindow: unresponsive'})
    browserWindow.destroy()
  })

  var webContents = browserWindow.webContents
  webContents.setAudioMuted(true)
  if(devMode){
    webContents.openDevTools()
  }

  /****
   * 'did-finish-load' fires when the onload event was dispatched
   * note: 'did-finish-load' fires at the end of all 'did-get-redirect-request'
   * events
   */
  webContents.on('did-finish-load', event => {
    debug('webContents: did-finish-load')
    /****
     * Ask scrapePreload.js to send back the docDetails
     */
    webContents.send('sendDocDetails', '')
  })
  /****
   * note: did-fail-load seems to get called after certificate-error,
   * so just let did-fail-load handle certificate-error if it occurs.
   * Also, 'did-fail-load' will emit on any resource on the page not loading
   * as well, so only send back error and destroy window when its the BrowserWindow
   * url that failed to load. This might mess up if a resource has the
   * same url that the BrowserWindow is going to.
   */
  webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    debug(`
      webContents: did-fail-load
      errorCode: ${errorCode}
      errorDescription: ${errorDescription}
      validatedURL: ${validatedURL}
      req.params.pageUrl: ${req.params.pageUrl}
    `)
    /****
     *  validatedURL seems to put a trailing slash on the end if its just the domain,
     *  e.g. http://foo.com would be http://foo.com/
     */
    if(validatedURL === req.params.pageUrl || validatedURL === `${req.params.pageUrl}/`){
      debug('validatedURL === req.params.pageUrl')
      res.status(500).json({errorMessage: 'webContents: did-fail-load'})
      browserWindow.destroy()
    }
  })
  webContents.on('crashed', event => {
    debug('webContents: crashed')
    res.status(500).json({errorMessage: 'webContents: crashed'})
    browserWindow.destroy()
  })
  /****
   * 'did-get-redirect-request' will fire on any resource on the page that
   * is redirected, so only update the req.params.pageUrl when its the
   * BrowserWindow url that's being redirected. This might mess up
   * if a resource has the same url that the BrowserWindow is going to.
   */
  webContents.on('did-get-redirect-request', (event, oldURL, newURL) => {
    debug(`
      webContents: did-get-redirect-request
      oldURL: ${oldURL}
      newURL: ${newURL}
    `)
    if(oldURL === req.params.pageUrl){
      /****
       * Update the req.params.pageUrl to the new location redirected to
       */
      req.params.pageUrl = newURL
    }
  })

  browserWindow.loadURL(urlToScrape)

  /****
   * Here we receive the document text, title etc. that scrapePreload.js
   * messaged us.
   */
  ipcMain.on('returnDocDetails', function(event, arg) {
    debug('returnDocDetails')
    debug(arg)
    var docDetails = JSON.parse(arg)
    debug(docDetails.documentTitle)
    /****
     * Dont need to collapse whitespace here as doing that in addPage.js
     */
    req.body.pageTitle = docDetails.documentTitle
    req.body.pageText = docDetails.documentText
    req.body.pageDescription = docDetails.documentDescription
    browserWindow.destroy()
    addPage(req, res, next)
  })

  ipcMain.on('returnDocDetailsError', function(event, arg) {
    debug('returnDocDetailsError')
    res.status(500).json({errorMessage: JSON.stringify(arg)})
    browserWindow.destroy()
  })
}

module.exports = scrapeAndAddPage
