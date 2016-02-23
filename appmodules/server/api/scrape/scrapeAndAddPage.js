'use strict';

var fs = require('fs')
var url = require('url')
var path = require('path')

var electron = require('electron')
var BrowserWindow = electron.BrowserWindow
var ipcMain = electron.ipcMain

var addPage = require('../addPage')

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
 */

var browserWindow

function scrapeAndAddPage(req, res, next) {
  /****
   * Using url.parse to put a trailing slash on the end of urls
   * that have no path. This is to remain consistent, so dont end
   * up saving http://foo.com and http://foo.com/ as different
   * pages - we are also doing it in addPage for the times when
   * we are not scraping (e.g. when addPage gets page data
   * from a browser extension)
   */
  var urlToScrape = url.parse(req.params.pageUrl).href
  var devMode = process.env.NODE_ENV === 'development'

  browserWindow = new BrowserWindow({show: devMode})
  browserWindow.loadURL(path.join('file://', __dirname, 'webviewContainerWindow.html'))

  //TODO remember to do browserWindow.on('closed' and also destroy on error
  // also see what else from below should use
  // make sure i remove all ipcMain listeners http://bit.ly/218oSrx


  browserWindow.on('closed', () => {
    console.log('browserWindow closed')
    browserWindow = null
    webContents = null
    ipcMain.removeAllListeners('returnDocDetails')
    ipcMain.removeAllListeners('webview-log')
    ipcMain.removeAllListeners('webview-error')
  })

  browserWindow.on('unresponsive', () =>
      logErrorDestroyBrowserAndRespond('BrowserWindow: unresponsive', res)
  )

  var webContents = browserWindow.webContents
  webContents.setAudioMuted(true)
  if(devMode){
    webContents.openDevTools()
  }

  webContents.once('did-finish-load', event => {
    console.log('browserWindow webContents did-finish-load')
    /****
     * Tell renderer to start loading urlToScrape
     */
    browserWindow.send('createAndLoadWebview', urlToScrape)
  })

  webContents.once('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    var errMessage = `
      BrowserWindow webContents: did-fail-load
      errorCode: ${errorCode}
      errorDescription: ${errorDescription}
      validatedURL: ${validatedURL}
      req.params.pageUrl: ${req.params.pageUrl}
    `
    logErrorDestroyBrowserAndRespond(errMessage, res)
  })

  webContents.once('crashed', event =>
    logErrorDestroyBrowserAndRespond('BrowserWindow webContents: crashed', res)
  )

  ipcMain.on('webview-log', (event, logMessage) => console.log(logMessage))

  ipcMain.once('webview-error', (event, errorMessage) =>
    logErrorDestroyBrowserAndRespond(errorMessage, res)
  )

  ipcMain.once('returnDocDetails', (event, message) => {
    console.log('returnDocDetails')
    //console.log(message)
    var docDetails = JSON.parse(message)
    /****
     * Dont need to collapse whitespace here as doing that in addPage.js
     */
    req.body.pageTitle = docDetails.documentTitle
    req.body.pageText = docDetails.documentText
    req.body.pageDescription = docDetails.documentDescription
    browserWindow.destroy()
    //console.dir(req.body)
    addPage(req, res, next)
  })

}

function logErrorDestroyBrowserAndRespond(errorMessage, res){
  console.error(errorMessage)
  res.status(500).json({errorMessage: errorMessage})
  browserWindow.destroy()
}

module.exports = scrapeAndAddPage
