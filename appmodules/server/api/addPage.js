'use strict';

var path = require('path')
var url = require('url')
var _ = require('lodash')

var domainParser = require('domain-parser')
var Promise = require("bluebird")
var debug = require('debug')('MarkSearch:addPage')
var save2db = require(path.join('..', '..', 'db', 'save2db'))
var archiveUrl = require(path.join('..', 'archive.is'))
var safeBrowsingCheck = require(path.join('..', 'safeBrowsing'))
var collapseWhiteSpace = require(path.join('..', '..', 'collapseWhiteSpace'))

function addPage(req, res, next) {
  var pageUrl = req.params.pageUrl
  var pageTitle = collapseWhiteSpace(req.body.pageTitle)
  var pageText = collapseWhiteSpace(req.body.pageText)
  var pageDescription = collapseWhiteSpace(req.body.pageDescription)
  debug('addPage running')
  /******
   *  When saving a page, we’re saving:
   *  URL (as _id) - String - e.g. 'http://popurls.com/'
   *  pageTitle - String
   *  pageText - String
   *  pageDescription - String
   *  dateCreated - Number - e.g. Date.now()
   *  Archive.is link (as archiveLink) - String - e.g. 'https://archive.is/pFvwT'
   *  SafeBrowsing details (as safeBrowsing) - Object - e.g. {safeBrowsing: {possiblyUnsafe: true, details: ‘malware'}}
   ******/
    //do some validation on this
    //console.log('hello colors test'.red);
  debug(pageUrl)
  debug(req.body)
  debug('url domain')
  /****
   * Parse the pageUrl string into a url and then get the domain from that url
   * and remove any subdomains
   */
  var pageUrlHostname = url.parse(pageUrl).hostname
  var domain = domainParser(pageUrlHostname).domainName
  debug('tld.getDomain')
  debug(domain)
  var pageDoc = {
    _id: pageUrl,
    pageTitle: pageTitle,
    pageText: pageText,
    pageDescription: pageDescription,
    pageDomain: domain,
    dateCreated: Date.now(),
    archiveLink: null,
    safeBrowsing: {
      possiblyUnsafe: false,
      details: null
    }
  }
  debug('pageDoc')
  debug(pageDoc)
  var db = req.app.get('pagesDB')
  /****
   * We're doing two save's rather than one so that the basic page details are
   * available to search straight away, as the archiveURL and the safeBrowsing
   * details rely on a request to a third party server and could end up taking a
   * while (e.g. could take up to 10 seconds for a server to respond), the extra
   * stuff of the archive url and the safe browsing details are not as important
   * and can be added to the page details and resaved later in the second save to db
   */
  save2db(db, pageDoc)
      .then(pageDocAndHttpStatus =>{
        /*****
         * if it wasn't already there, we added it, if it was already there, we updated it.
         * Send appropriate status code for either
         * http://httpstatus.es/201
         * http://httpstatus.es/204
         * http://stackoverflow.com/questions/2342579/
         *****/
        res.status(pageDocAndHttpStatus.httpStatusCode).end()
        /****
         * update the quick-search index
         * We dont wait for the index to update as they are unlikely to search for text
         * straight away from the page they just saved.
         * Note: there will likely only ever be one user connecting, so there shouldn't be any
         * performance issues with re-building index straight away after each save
         */
        return [
          pageDocAndHttpStatus.returnedDoc,
          db.search({fields: ['pageTitle', 'pageDescription', 'pageText'], build: true})
        ]
      })
      /****
       * Get archiveUrl & safeBrowsingCheck running in parallel, rather than in sequence,
       * so dont have to wait for archiveUrl to finish before starting safeBrowsingCheck
       */
      .spread( (returnedDoc, searchBuild) => {
        return [archiveUrl(returnedDoc), safeBrowsingCheck(returnedDoc)]
      })
      .spread( (archiveReturnedDoc, safeBrowsingReturnedDoc) => {
        archiveReturnedDoc.safeBrowsing = safeBrowsingReturnedDoc.safeBrowsing
        return save2db(db, archiveReturnedDoc)
      })
      .catch(err => {
        /****
         * There was an error with the database, send back an appropriate
         * http error code
         */
        console.log(`There was an error with the database`)
        console.error(err)
        res.status(503).end()
      })
}

module.exports = addPage