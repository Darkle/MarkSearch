'use strict';

var _ = require('lodash')
var validator = require('validator')
var validUrl = require('valid-url')

function isStringCheck(string){
  if(!_.isString(string)){
    throw new Error('requestDataValidation error: is not a string')
  }
}

function checkIfValidUrl(url){
  if(!validUrl.isWebUri(url)){
    throw new Error('requestDataValidation error: not a valid url')
  }
}

function requestDataValidation(req){
  /****
   * req.params.pageUrl is used in api.js for:
   *    getSinglePage on route /api/get/:pageUrl,
   *    addPage on route /api/add/:pageUrl,
   *    deletePage on route /api/remove/:pageUrl
   *
   * req.params.pageUrl is used in index.js for:
   *    scrapeAndAddPage on route /frontendapi/scrapeAndAdd/:pageUrl,
   *    deletePage on route /frontendapi/remove/:pageUrl,
   *    openUrlInBrowser on route /frontendapi/openUrlInBrowser/:pageUrl
   *
   */
  if(_.get(req, 'params.pageUrl')){
    isStringCheck(req.params.pageUrl)
    req.params.pageUrl = req.params.pageUrl.toLowerCase()
    checkIfValidUrl(req.params.pageUrl)
  }
  /****
   * search data from /frontendapi/search/:searchTerms route in index.js
   * & from /api/search/:searchTerms route in api.js
   * req.params.searchTerms
   * knex does sql injection checks for bound values so I think I don't have
   * to do anything more with req.params.searchTerms
   */
  if(_.get(req, 'params.searchTerms')){
    isStringCheck(req.params.searchTerms)
  }
  /****
   * the updateMarkSearchSettings validation is done in appSettings.js
   */
  /****
   * changePagesDBlocation & checkIfFileIsBinary use parse-filepath, so I think they're ok.
   */
  /****
   * emailBookmarklet data from /frontendapi/settings/emailBookmarklet/ route in api.js
   * req.body.email
   * We use the mailgun api in emailBookmarklet to validate the email, so here just check that
   * it's a string.
   */
  if(_.get(req, 'body.email')){
    isStringCheck(req.body.email)
  }
  /****
   * addPage data from /api/add/:pageUrl route in api.js
   * req.params.pageUrl - checked above
   * req.body.pageTitle
   * req.body.pageText
   * req.body.pageDescription
   * validator.escape() replaces <, >, &, ', " and / with HTML entities
   */
  if(_.get(req, 'body.pageTitle')){
    isStringCheck(req.body.pageTitle)
    req.body.pageTitle = validator.escape(req.body.pageTitle)
  }
  if(_.get(req, 'body.pageText')){
    isStringCheck(req.body.pageText)
    req.body.pageText = validator.escape(req.body.pageText)
  }
  if(_.get(req, 'body.pageDescription')){
    isStringCheck(req.body.pageDescription)
    req.body.pageDescription = validator.escape(req.body.pageDescription)
  }

  return req
}

module.exports = requestDataValidation