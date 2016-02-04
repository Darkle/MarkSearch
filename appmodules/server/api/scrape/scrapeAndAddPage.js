'use strict';

var path = require('path')
var fs = require('fs')
var url = require('url')

var debug = require('debug')('MarkSearch:scrapeAndAddPage')
var electron = require('electron')
var BrowserWindow = electron.BrowserWindow
var ipcMain = electron.ipcMain

var addPage = require(path.join(__dirname, '..', 'addPage'))

/****
 * A generator on the front end is calling scrapeAndAddPage, so
 * shouldn't have any issues with req, res, next etc. being overwritten
 * by subsequent calls while event listeners are still running
 *
 * TODO: Maybe refactor this a bit, bit of duplicate code
 */
function scrapeAndAddPage(req, res, next) {
  debug('scrapeAndAddPage running')

  var urlToScrape
  var devMode = req.app.get('env') === 'development'
  var numTimesRedirected = 0
  try{
    /****
     * Doing this so that we create a somwhat valid url out of what is sent.
     * e.g. if req.params.pageUrl is say http://nonsense:port/yay,
     * the browser will not be able to load that - but it doesn't fire a
     * did-fail-load event though, it just seems to sit there. However
     * if we parse it, url.parse converts it to http://nonsense/:port/yay,
     * which works properly in that it properly fails to load and about:blank
     * is loaded instead.
     * (haven't tested this extensively)
     * http://bit.ly/1X2gwM2
     */
    urlToScrape = url.parse(req.params.pageUrl).href
  }
  catch(err){
    debug(
        `Error Parsing URL
        ${err.message}
        ${err.stack}`
    )
    res.status(500).json({errorMessage: 'Error Parsing URL'})
  }

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
     *  note: validatedURL seems to put a trailing slash on the end if its a url with no
     *  path - e.g. http://foo.com would be http://foo.com/
     *  Should be ok as we are using url.parse().href which adds a trailing slash
     *  at the start of scrapeAndAddPage and on did-get-redirect-request
     */
    if(validatedURL === urlToScrape){
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
      numTimesRedirected = numTimesRedirected + 1
      /****
       * So we dont get into an infinite redirect loop
       */
      if(numTimesRedirected < 6){
        /****
         * Update the req.params.pageUrl to the new location redirected to so
         * it's the url it redirected to when we send req through to addPage.
         * Using url.parse to add a trailing slash if its a url with no path
         */
        urlToScrape = url.parse(newURL).href
        req.params.pageUrl = urlToScrape
      }
      else{
        debug('webContents: infinite redirect loop ')
        res.status(500).json({errorMessage: 'webContents: infinite redirect loop'})
        browserWindow.destroy()
      }
    }
  })

  /****
   * Here we receive the document text, title etc. that scrapePreload.js
   * messaged us.
   */
  ipcMain.on('returnDocDetails', function(event, arg) {
    debug('returnDocDetails')
    //debug(arg)
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
    debug(arg)
    res.status(500).json({errorMessage: JSON.stringify(arg)})
    browserWindow.destroy()
  })

  webContents.loadURL(urlToScrape, {"extraHeaders" : "pragma: no-cache\n"})
}

module.exports = scrapeAndAddPage
