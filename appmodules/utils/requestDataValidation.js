'use strict';

var _ = require('lodash')
var validator = require('validator')
var validUrl = require('valid-url')
var inspector = require('schema-inspector')

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
 * We lowercase the pageUrl just so an uppercase url isn't thought of
 * as a different url to a lowercase version of the same url.
 *
 * search data from /frontendapi/search/:searchTerms route in index.js
 * & from /api/search/:searchTerms route in api.js
 * req.params.searchTerms
 * knex does sql injection checks for bound values so I think I don't have
 * to do anything more with req.params.searchTerms
 *
 * the updateMarkSearchSettings validation is done in appSettings.js
 *
 * changePagesDBlocation & checkIfFileIsBinary use parse-filepath, so I think they're ok.
 *
 * emailBookmarklet data from /frontendapi/settings/emailBookmarklet/ route in api.js
 * req.body.email
 * We use the mailgun api in emailBookmarklet to validate the email, so here just check that
 * it's a string.
 *
 * addPage data from /api/add/:pageUrl route in api.js
 * req.params.pageUrl - checked above
 * req.body.pageTitle
 * req.body.pageText
 * req.body.pageDescription
 * validator.escape() replaces <, >, &, ', " and / with HTML entities
 */

var reqParamsSanitization = {
  type: 'object',
  properties: {
    pageUrl: {
      type: 'string',
      optional: true,
      rules: ['lower']
    }
  }
}

var reqParamsValidation = {
  type: 'object',
  properties: {
    pageUrl: {
      type: 'string',
      optional: true,
      pattern: 'lowerString',
      maxLength: 2000,
      exec: function(scheme, post){
        if(!validUrl.isWebUri(post)){
          this.report('req.params.pageUrl is not a valid web url')
        }
      }
    },
    searchTerms: {
      type: 'string',
      optional: true
    }
  }
}

var reqBodySanitization = {
  type: 'object',
  properties: {
    pageTitle: {
      type: 'string',
      optional: true,
      exec: (schema, post) => validator.escape(post)

    },
    pageText: {
      type: 'string',
      optional: true,
      exec: (schema, post) => validator.escape(post)
    },
    pageDescription: {
      type: 'string',
      optional: true,
      exec: (schema, post) => validator.escape(post)
    }
  }
}

var reqBodyValidation = {
  type: 'object',
  properties: {
    email: {
      type: 'string',
      optional: true
    },
    pageTitle: {
      type: 'string',
      optional: true
    },
    pageText: {
      type: 'string',
      optional: true
    },
    pageDescription: {
      type: 'string',
      optional: true
    }
  }
}

function requestDataValidation(req){

  inspector.sanitize(reqParamsSanitization, req.params)
  inspector.sanitize(reqBodySanitization, req.body)

  var validReqParams = inspector.validate(reqParamsValidation, req.params)
  if(!validReqParams.valid){
    let errMessage = `Error(s) with the req.params data in requestDataValidation : ${validReqParams.format()}`
    console.error(errMessage)
    throw new Error(errMessage)
  }

  var validReqBody = inspector.validate(reqBodyValidation, req.body)
  if(!validReqBody.valid){
    let errMessage = `Error(s) with the req.body data in requestDataValidation : ${validReqBody.format()}`
    console.error(errMessage)
    throw new Error(errMessage)
  }

  return req
}

module.exports = requestDataValidation