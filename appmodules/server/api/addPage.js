'use strict'

var url = require('url')

var domainParser = require('domain-name-parser')
var _ = require('lodash')

var pagesdb = require('../../db/pagesdb')
var archiveUrl = require('../archive.is')
var collapseWhiteSpace = require('../../utils/collapseWhiteSpace')
var appLogger = require('../../utils/appLogger')

function addPage(req, res) {
  /****
   * When saving a page, we’re saving:
   *  pageUrl - String - e.g. 'http://foo.com'
   *  dateCreated - Integer (unix timestamp)
   *  pageDomain - String- e.g. 'foo.com'
   *  pageTitle - String
   *  pageText - String
   *  pageDescription - String
   *  archiveLink - String - e.g. 'https://archive.is/pFvwT'
   *  safeBrowsing - String (JSON stringified)
   *
   * requestDataValidation in the index.js and api.js does validation on the params
   * and body data.
   */
  var pageUrl = req.params.pageUrl
  var pageTitle = _.get(req, 'body.pageTitle.length') ? collapseWhiteSpace(req.body.pageTitle) : null
  var pageText = _.get(req, 'body.pageText.length') ? collapseWhiteSpace(req.body.pageText) : null
  var pageDescription = _.get(req, 'body.pageDescription.length') ? collapseWhiteSpace(req.body.pageDescription) : null
  var pageUrlHostname = url.parse(req.params.pageUrl).hostname
  /****
   * Get the domain from pageUrlHostname and remove any subdomains
   */
  var pageDomain = domainParser(pageUrlHostname).domainName

  var pageData = {
    pageUrl,
    dateCreated: Date.now(),
    pageDomain,
    pageTitle,
    pageText,
    pageDescription,
    archiveLink: null,
    safeBrowsing: null
  }

  /****
   * We're doing two save's rather than one so that the basic page details are
   * available to search straight away, as the archiveURL and the safeBrowsing
   * details rely on a request to a third party server and could end up taking a
   * while (e.g. could take up to 10 seconds for a server to respond). The archive
   * url and the safe browsing details are not as important and can be saved to the
   * db later.
   *
   * Binding pageUrl, res, req here in case addPage gets called again and pagesdb.upsertRow or
   * archiveUrl/safeBrowsingData hasn't finished yet - don't want safeBrowsing or
   * archive.is to use overwritten pageData.pageUrl or res from the new addPage call.
   * Note: when using this.pageUrl or this.res/req, must use a regular function, as an arrow
   * function seems to mess up the 'this' context for bluebird.
   */
  pagesdb.upsertRow(pageData)
    .bind({pageUrl, req, res})
    .then(function() {
      this.res.status(200).end()
      return this.pageUrl
    })
    .catch(function(err) {
      global.devMode && console.log(`There was an error saving the page to the database`)
      global.devMode && console.error(err)
      this.res.status(500).end()
      /****
       * Rethrow the error to make it skip archiveUrl. No
       * point doing them if the initial page data hasn't made it into the database.
       */
      throw new Error(err)
    })
    .then(archiveUrl)
    .then(archiveIsUrl => {
      if(archiveIsUrl){
        return pagesdb.updateColumns(archiveIsUrl)
      }
    })
    .catch(function(err) {
      global.devMode && console.error(err)
      var requestForError = this.req
      var responseForError = this.res
      appLogger.log.error({err, req: requestForError, res: responseForError})
    })

}

module.exports = addPage
