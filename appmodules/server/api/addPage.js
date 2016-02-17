'use strict';

var path = require('path')
var url = require('url')

var _ = require('lodash')
var domainParser = require('domain-parser')
var debug = require('debug')('MarkSearch:addPage')

var save2db = require('../../db/save2db')
var buildIndex = require('../../db/buildIndex')
var archiveUrl = require('../archive.is')
var safeBrowsingCheck = require('../safeBrowsing')
var collapseWhiteSpace = require('../../utils/collapseWhiteSpace')

function addPage(req, res, next) {
  /****
   * Parsing the url to get the href from url.parse as that will
   * add a trailing slash to the end of the href if it's just a url
   * without a path. Doing this so that we dont save the same url
   * twice - e.g. if they saved http://foo.com, and then later
   * saved http://foo.com/, that would be intepreted as a seperate
   * site, which is not what we want, so use url.parse to
   * automatically add the trailing slash.
   *
   * When saving a page, we’re saving:
   * URL (as _id) - String - e.g. 'http://popurls.com/'
   * pageTitle - String
   * pageText - String
   * pageDescription - String
   * dateCreated - Number - e.g. Date.now()
   * Archive.is link (as archiveLink) - String - e.g. 'https://archive.is/pFvwT'
   * SafeBrowsing details (as safeBrowsing) - Object - e.g. {safeBrowsing: {possiblyUnsafe: true, details: ‘malware'}}
   */

  var parsedUrl = url.parse(req.params.pageUrl.toLowerCase())
  var pageUrl = parsedUrl.href
  var pageTitle = collapseWhiteSpace(req.body.pageTitle)
  var pageText = collapseWhiteSpace(req.body.pageText)
  var pageDescription = collapseWhiteSpace(req.body.pageDescription)
  debug('addPage running')
    //do some validation on this
    //console.log('hello colors test'.red);
  debug(pageUrl)
  //debug(req.body)
  debug('url domain')
  /****
   * Get the domain from the parsedUrl.hostname and remove any subdomains
   */
  var domain = domainParser(parsedUrl.hostname).domainName
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
  //debug('pageDoc')
  //debug(pageDoc)
  var db = req.app.get('pagesDB')
  var appName = req.app.get('marksearchAppName')
  var appVersion = req.app.get('marksearchVersion')
  /****
   * We're doing two save's rather than one so that the basic page details are
   * available to search straight away, as the archiveURL and the safeBrowsing
   * details rely on a request to a third party server and could end up taking a
   * while (e.g. could take up to 10 seconds for a server to respond), the extra
   * stuff of the archive url and the safe browsing details are not as important
   * and can be added to the page details and resaved later in the second save to db
   */
  would like to have a catch for each, so maybe there's a bind method for bluebird where I could bind an
      outside variable and if res.status().end() has already been called, then subsequent catches
  dont call it - maybe ask for advice online on ow to track if we arleady sent back a response - maybe
  express has a feature for that, or maybe i could enclose it in a closure
  Maybe see if there are any bluebird books out on safari/manning/leanpub, also check google for new
      blog posts with date filter, also check reddit/hn

  when saving the safebrowsing and archive.is data, dont need to hold on to the doc details any more, cause we
  are just using the update sql feature and just updating those feilds

  Should I switch archive.is to saving a pdf backup of the page? I mean its super simple in scraper, and maybe relying
      on archive.is for backups of every page is not a good idea - double check how large the pdfs are
      so then could prolly get rid of the res.status(503).end() in the last catch as dont really need it if just
    safeBrowsing fails - if dont use archive.is, rememebr need to change db and render and addPage - to a search
      for archive in code
      Would need to generate pdfs for bookmarklets and extensions, so at the end of addPage, would need to
      call scrape again ( or maybe a diff scrape just for non-scraping pdfs and save that to db) - prolly
      easier to just keep using archive.is, but then again, a pdf does make a bit of sense

      For the browser extensions, it may actually be possible to create a pdf of the page and send
      it to marksearch to save as part of the addPage
    http://stackoverflow.com/questions/13990127/get-pdf-of-the-current-page-in-a-google-chrome-extension
    - no dont send the page capture on saving a page as that will add megabytes to the transfer
      maybe just stick with archive.is


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
         * (Re)build the quick-search index.
         * (dont wait for it to rebuild).
         */
        buildIndex(db, 'addPage')
        return pageDocAndHttpStatus.returnedDoc
      })
      /****
       * Get archiveUrl & safeBrowsingCheck running in parallel, rather than in sequence,
       * so dont have to wait for archiveUrl to finish before starting safeBrowsingCheck
       */
      .then( returnedDoc =>
         [
          archiveUrl(returnedDoc),
          safeBrowsingCheck(appName, appVersion, returnedDoc)
        ]
      )
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