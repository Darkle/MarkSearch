'use strict'

var path = require('path')

var inspector = require('schema-inspector')

var addPage = require('../addPage')
var appLogger = require('../../../utils/appLogger')
var schemas = require('../../requestDataValidationAndSanitizationSchema')

var electron = require('electron')
var BrowserWindow = electron.BrowserWindow
var ipcMain = electron.ipcMain

/****
 * A generator on the front end is calling scrapeAndAddPage, so
 * shouldn't have any issues with req, res, next etc. being overwritten
 * by subsequent calls while event listeners are still running
 *
 * browserWindow calls the renderer.js which preloads the webviewPreload.js and
 * then loads the urlToScrape we passed in to renderer. When the page has loaded in
 * the webview element in renderer, webviewPreload.js sends renderer.js the data
 * from the page, and renderer in turn sends that data back to browserWindow here
 * via ipcMain.on('returnDocDetails'.
 * Doing it this way as using a webview tag is a bit more secure than a regular
 * BrowserWindow. http://bit.ly/218pBce
 *
 */

var browserWindow

function scrapeAndAddPage(req, res, next) {

  /****
   * req.params.pageUrl is validated in requestDataValidation.js
   */
  var urlToScrape = req.params.pageUrl

  browserWindow = new BrowserWindow({show: false})
  browserWindow.loadURL(path.join('file://', __dirname, 'webviewContainerWindow.html'))

  browserWindow.on('closed', () => {
    browserWindow = null
    webContents = null
    ipcMain.removeAllListeners('returnDocDetails')
    ipcMain.removeAllListeners('webview-log')
    ipcMain.removeAllListeners('webview-error')
  })

  browserWindow.on('unresponsive', () =>
      logErrorDestroyBrowserAndRespond('BrowserWindow: unresponsive', req, res)
  )

  var webContents = browserWindow.webContents
  webContents.setAudioMuted(true)
  if(global.devMode){
    webContents.openDevTools()
  }

  webContents.once('did-finish-load', () => {
    /****
     * Tell renderer to start loading urlToScrape
     */
    browserWindow.send('createAndLoadWebview', urlToScrape)
  })

  webContents.once('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    var errMessage = `
      BrowserWindow webContents: did-fail-load
      errorCode: ${ errorCode }
      errorDescription: ${ errorDescription }
      validatedURL: ${ validatedURL }
      req.params.pageUrl: ${ req.params.pageUrl }
    `
    logErrorDestroyBrowserAndRespond(errMessage, req, res)
  })

  webContents.once('crashed', () => {
    logErrorDestroyBrowserAndRespond('BrowserWindow webContents: crashed', req, res)
  })

  ipcMain.on('webview-log', (event, logMessage) => {
    global.devMode && console.log(logMessage)
  })

  ipcMain.once('webview-error', (event, errorMessage) =>
    logErrorDestroyBrowserAndRespond(errorMessage, req, res)
  )

  ipcMain.once('returnDocDetails', (event, message) => {
    var docDetails = JSON.parse(message)
    /****
     * Dont need to collapse whitespace here as doing that in addPage.js
     */
    req.body.pageTitle = docDetails.documentTitle
    req.body.pageText = docDetails.documentText
    req.body.pageDescription = docDetails.documentDescription
    browserWindow.destroy()
    // global.devMode && console.dir(req.body)
    /*
    * We need to do req.body sanitization & validate here as scrapeAndAddPage only gets passed
    * the req.params.pageUrl and we make the req.body.pageTitle etc. here from
    * the scrape, so need to validate the new req.body stuff in here.
    */
    inspector.sanitize(schemas.reqBodySanitization, req.body)

    var validReqBody = inspector.validate(schemas.reqBodyValidation, req.body)
    if(!validReqBody.valid){
      let errMessage = `Error(s) with the req.body data in scrapeAndAddPage : ${ validReqBody.format() }`
      let err = new Error(errMessage)
      global.devMode && console.error(errMessage)
      appLogger.log.error({err, req, res})
      res.status(500).json({errorMessage: errMessage})
    }
    else{
      addPage(req, res, next)
    }
  })
}

function logErrorDestroyBrowserAndRespond(errorMessage, req, res) {
  global.devMode && console.error(`An Error Occurred: ${ errorMessage }`)
  var err = new Error(errorMessage)
  appLogger.log.error({err, req, res})
  browserWindow.destroy()
  res.status(500).json({errorMessage: errorMessage})
}

module.exports = scrapeAndAddPage
