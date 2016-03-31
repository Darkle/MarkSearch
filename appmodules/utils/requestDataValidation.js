'use strict';

var _ = require('lodash')
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
 * (We lowercase the pageUrl just so an uppercase url isn't thought of
 * as a different url to a lowercase version of the same url).
 *
 * req.params.searchTerms is used in index.js for:
 *    search on route /frontendapi/search/:searchTerms
 *
 * req.params.searchTerms is used in api.js for:
 *    search on route /api/search/:searchTerms
 *
 * (knex does sql injection checks for bound values so I think I don't have
 * to do anything more with req.params.searchTerms)
 *
 * req.body.email is used in api.js for:
 *    emailBookmarklet on route /frontendapi/settings/emailBookmarklet/
 *
 * (We use the mailgun api in emailBookmarklet to validate the email, so here just check that
 * it's a string).
 *
 * req.body.pageTitle is used in api.js for:
 *    addPage on route /api/add/:pageUrl
 *
 * req.body.pageText is used in api.js for:
 *    addPage on route /api/add/:pageUrl
 *
 * req.body.pageDescription is used in api.js for:
 *    addPage on route /api/add/:pageUrl
 *
 * the updateMarkSearchSettings validation is done in appSettings.js
 *
 * changePagesDBlocation & checkIfFileIsBinary use parse-filepath, so I think they're ok.
 *
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
      exec: function(schema, post) {
        if(_.isString(post)){
          post = post.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
        return post
      }
    },
    pageText: {
      type: 'string',
      optional: true,
      exec: function(schema, post) {
        if(_.isString(post)){
          post = post.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
        return post
      }
    },
    pageDescription: {
      type: 'string',
      optional: true,
      exec: function(schema, post) {
        if(_.isString(post)){
          post = post.replace(/</g, '&lt;').replace(/>/g, '&gt;')
        }
        return post
      }
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

  // var validReqParams = inspector.validate(reqParamsValidation, req.params)
  // if(!validReqParams.valid){
  //   let errMessage = `Error(s) with the req.params data in requestDataValidation : ${validReqParams.format()}`
  //   console.error(errMessage)
  //   throw new Error(errMessage)
  // }
  //
  // var validReqBody = inspector.validate(reqBodyValidation, req.body)
  // if(!validReqBody.valid){
  //   let errMessage = `Error(s) with the req.body data in requestDataValidation : ${validReqBody.format()}`
  //   console.error(errMessage)
  //   throw new Error(errMessage)
  // }

  return req
}

module.exports = requestDataValidation