'use strict';

var url = require('url')

var domainParser = require('domain-parser')
var _ = require('lodash')

var pagesdb = require('../../db/pagesdb')
var archiveUrl = require('../archive.is')
var safeBrowsingCheck = require('../safeBrowsing')
var collapseWhiteSpace = require('../../utils/collapseWhiteSpace')

function addPage(req, res, next) {
  /****
   * When saving a page, we’re saving:
   *  pageUrl - String - e.g. 'http://foo.com'
   *  dateCreated - Integer (unix timestamp)
   *  pageDomain - String- e.g. 'foo.com'
   *  pageTitle - String
   *  pageText - String
   *  pageDescription - String
   *  archiveLink - String - e.g. 'https://archive.is/pFvwT'
   *  safeBrowsing - String (JSON stringified) - e.g. {safeBrowsing: {possiblyUnsafe: true, details: ‘malware'}}
   *
   * Parsing the url to get the href from url.parse as that will
   * add a trailing slash to the end of the href if it's just a url
   * without a path. Doing this so that we dont save the same url
   * twice - e.g. if they saved http://foo.com, and then later
   * saved http://foo.com/, that would be intepreted as a seperate
   * site, which is not what we want, so use url.parse to
   * automatically add the trailing slash.
   */

  var parsedUrl = url.parse(req.params.pageUrl.toLowerCase())
  var pageUrl = parsedUrl.href
  var pageTitle = collapseWhiteSpace(req.body.pageTitle)
  var pageText = collapseWhiteSpace(req.body.pageText)
  var pageDescription = collapseWhiteSpace(req.body.pageDescription)

  /****
   * Get the domain from the parsedUrl.hostname and remove any subdomains
   */
  var pageDomain = domainParser(parsedUrl.hostname).domainName

  var pageData = {
    pageUrl: pageUrl,
    dateCreated: Date.now(),
    pageDomain: pageDomain,
    pageTitle: pageTitle,
    pageText: pageText,
    pageDescription: pageDescription,
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
   * Binding pageUrl here in case addPage gets called again and pagesdb.upsertRow or
   * archiveUrl/safeBrowsingData hasn't finished yet - don't want safeBrowsing or
   * archive.is to use overwritten pageData.pageUrl from the new addPage call.
   * Note: when using this.pageUrl, must use a regular function, as an arrow function
   * seems to mess up the 'this' context for bluebird.
   */
  pagesdb.upsertRow(pageData).bind({pageUrl: pageData.pageUrl})
      .then(function() {
        res.status(200).end()
        return this.pageUrl
      })
      .catch(err => {
        console.log(`There was an error saving the page to the database`)
        console.error(err)
        res.status(500).end()
        /****
         * Rethrow the error to make it skip archiveUrl and safeBrowsing. No
         * point doing them if the row hasn't made it into the database.
         */
        throw new Error(err)
      })
      /****
       * Get archiveUrl & safeBrowsingCheck running in parallel
       */
      .then( pageUrl => [archiveUrl(pageUrl), safeBrowsingCheck(pageUrl)])
      .spread(function(archiveIsUrl, safeBrowsingData){
        console.log('this.pageUrl')
        console.log(this.pageUrl)
        console.log('archiveIsUrl')
        console.log(archiveIsUrl)
        console.log('safeBrowsingData')
        console.log(safeBrowsingData)
      })
      .spread(function(archiveIsUrl, safeBrowsingData) {
        /****
         * _.merge will remove any null values
         */
        var updateData = _.merge(archiveIsUrl, safeBrowsingData)
        if(!_.isEmpty(updateData)){
          pagesdb.updateColumn(updateData, this.pageUrl)
        }
      })
      //.spread( (archiveIsUrl, safeBrowsingData) => {
      //  /****
      //   * _.merge will remove any null values
      //   */
      //  var updateData = _.merge(archiveIsUrl, safeBrowsingData)
      //  if(_.isEmpty(updateData)){
      //    return
      //  }
      //  var pageUrlKey = updateData.pageUrl
      //  updateData = _.omit(updateData, 'pageUrl')
      //  pagesdb.updateColumn(updateData, pageUrlKey)
      //})
      .catch(err => {
        console.error(err)
      })

}

module.exports = addPage