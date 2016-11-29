'use strict'

var url = require('url')

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
   *  safeBrowsing - String (JSON stringified) - note: we dont do this any more
   *
   * requestDataValidation in the index.js and api.js does validation on the params
   * and body data.
   */
  var pageUrl = req.params.pageUrl
  var pageTitle = _.get(req, 'body.pageTitle.length') ? collapseWhiteSpace(req.body.pageTitle) : null
  var pageText = _.get(req, 'body.pageText.length') ? collapseWhiteSpace(req.body.pageText) : null
  var pageDescription = _.get(req, 'body.pageDescription.length') ? collapseWhiteSpace(req.body.pageDescription) : null
  /*****
  * Getting the proper host domain is a little tough. There are a couple of libraries on npm, but most of
  * them use a static suffix list to check against, and the ones that dont have trouble with country tlds,
  * eg: http://bit.ly/2gCKffa
  *
  * So rather than using a suffix list and having to update it periodically, we're gonna grab the hostname
  * with node's url.parse, then prepend a . to the domain. That way, when they are searching by site,
  * we can match 'whatever site:bar.com' with results that have the domain '.bar.com' AND '.foo.bar.com'
  * - we're doing this by using the LIKE clause (http://bit.ly/2fwkWiV) for the WHERE clause when searching
  * by site in search.js. So searching 'whatever site:bar.com' would result in a WHERE clause something
  * like where "pageDomain" like '%.bar.com'. So in essence we are saying any rows that have a domain that
  * ends in '.bar.com'
  * note: we need the prepended dot, as if we didnt, searching for 'whatever site:bar.com' would
  * return results for the domains 'abcbar.com' and 'bar.com', which is not what we want, but we
  * would want results from both 'foo.bar.com' and 'bar.com'.
  * I think this should work ok with localhost and IP addresses too.
  */
  var pageDomain = `.${ url.parse(req.params.pageUrl).hostname }`

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
