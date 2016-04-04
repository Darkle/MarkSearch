'use strict';

var url = require('url')

var _ = require('lodash')
var validUrl = require('valid-url')
var inspector = require('schema-inspector')
var validator = require('validator')

var appLogger = require('./appLogger')

/****
 * req.params.pageUrl is used in api.js for:
 *    getSinglePage on route /api/get/:pageUrl,
 *    addPage on route /api/add/:pageUrl,
 *    deletePage on route /api/remove/:pageUrl
 *
 * req.params.pageUrl is used in index.js for:
 *    scrapeAndAddPage on route /frontendapi/scrapeAndAdd/:pageUrl,
 *    deletePage on route /frontendapi/remove/:pageUrl,
 *
 * We parse the pageUrl to get the href from url.parse as that will
 * add a trailing slash to the end of the href if it's just a url
 * without a path. Doing this so that we dont accidentally save the
 * same url twice - e.g. if they saved http://foo.com, and then later
 * saved http://foo.com/, that would be intepreted as a seperate
 * site, which is not what we want, so use url.parse to
 * automatically add the trailing slash.
 * Also, it will convert any domain text that might be accidentally in
 * upper case to lower case - e.g. convert https://GOogle.com/FooBar
 * to https://google.com/FooBar (note: it preserves the case for the path,
 * which is what we want.)
 *
 * req.params.searchTerms is used in index.js for:
 *    search on route /frontendapi/search/:searchTerms
 *
 * req.params.searchTerms is used in api.js for:
 *    search on route /api/search/:searchTerms
 *
 * (knex in search.js does sql injection checks for bound values so I don't think I have
 * to do anything more with req.params.searchTerms)
 *
 * req.params.urlToOpen is used in index.js for:
 *    openUrlInBrowser on route /frontendapi/openUrlInBrowser/:urlToOpen
 *
 * (isUrlAllowedToOpen() checks urlToOpen to make sure it is one of the urls on the
 * settings page or help page or about page)
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
 * (validator.escape() - http://bit.ly/1TpNhUn )
 * 
 * the updateMarkSearchSettings validation is done in appSettings.js
 *
 * changePagesDBlocation & checkIfFileIsBinary use parse-filepath, so I think they're ok.
 */

function allowedToOpenUrl(url){
  return [
    'http://blog.cloudimage.io/2015/10/19/what-is-prebrowsing-and-how-it-can-drastically-improve-your-page-loading-time/',
    `${global.msServerAddr.combined}/help#`,
    `${global.msServerAddr.combined}/help#browserAddon`,
    `${global.msServerAddr.combined}/help#bookmarklet`
  ].indexOf(url) > -1
}

var reqParamsSanitization = {
  type: 'object',
  properties: {
    pageUrl: {
      type: 'string',
      optional: true,
      exec: function(schema, post) {
        if(_.isString(post)){
          post = url.parse(post).href
        }
        return post
      }
    }
  }
}

var reqParamsValidation = {
  type: 'object',
  properties: {
    pageUrl: {
      type: 'string',
      optional: true,
      maxLength: 2000,
      exec: function(scheme, post){
        if(_.isString(post) && !validUrl.isWebUri(post)){
          this.report('req.params.pageUrl is not a valid web url')
        }
      }
    },
    searchTerms: {
      type: 'string',
      optional: true
    },
    urlToOpen: {
      type: 'string',
      maxLength: 2000,
      optional: true,
      exec: function(scheme, post){
        if(_.isString(post)){
          if(!validUrl.isWebUri(post) || !allowedToOpenUrl(post)){
            this.report('req.params.urlToOpen is not a valid web url or is not a url allowed to be opened')
          }
        }
      }
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
          post = validator.escape(post)
        }
        return post
      }
    },
    pageText: {
      type: 'string',
      optional: true,
      exec: function(schema, post) {
        if(_.isString(post)){
          post = validator.escape(post)
        }
        return post
      }
    },
    pageDescription: {
      type: 'string',
      optional: true,
      exec: function(schema, post) {
        if(_.isString(post)){
          post = validator.escape(post)
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

function requestDataValidation(req, res, next){

  inspector.sanitize(reqParamsSanitization, req.params)
  inspector.sanitize(reqBodySanitization, req.body)

  var validReqParams = inspector.validate(reqParamsValidation, req.params)
  if(!validReqParams.valid){
    let errMessage = `Error(s) with the req.params data in requestDataValidation : ${validReqParams.format()}`
    let err = new Error(errMessage)
    console.error(errMessage)
    appLogger.log.error({err})
    res.status(500).json(errMessage)
  }

  var validReqBody = inspector.validate(reqBodyValidation, req.body)
  if(!validReqBody.valid){
    let errMessage = `Error(s) with the req.body data in requestDataValidation : ${validReqBody.format()}`
    let err = new Error(errMessage)
    console.error(errMessage)
    appLogger.log.error({err})
    res.status(500).json(errMessage)
  }

  if(validReqParams.valid && validReqBody.valid){
    next()
  }

}

module.exports = requestDataValidation