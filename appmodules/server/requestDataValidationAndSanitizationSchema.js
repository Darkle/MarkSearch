'use strict'

var url = require('url')

var _ = require('lodash')
var validUrl = require('valid-url')
var validator = require('validator')

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
 * (note: knex in search.js also does sql injection checks for bound values )
 *
 * req.params.urlToOpen is used in index.js for:
 *    openUrlInBrowser on route /frontendapi/openUrlInBrowser/:urlToOpen
 *
 * (isUrlAllowedToOpen() checks urlToOpen to make sure it is one of the urls on the
 * settings page or help page or about page)
 *
 * req.body.email is used in index.js for:
 *    emailBookmarklet on route /frontendapi/settings/emailBookmarklet/
 *
 * req.body.bookmarkletText is used in index.js for:
 *    emailBookmarklet on route /frontendapi/settings/emailBookmarklet/
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
 * req.body.dateFilterStartDate is used in api.js for:
 *    getAllPages on route /api/getall/
 *
 * req.body.dateFilterEndDate is used in api.js for:
 *    search on route /api/search/:searchTerms
 *
 * req.body.dateFilterStartDate is used in index.js for:
 *    getAllPages on route /frontendapi/getall/
 *
 * req.body.dateFilterEndDate is used in index.js for:
 *    search on route /frontendapi/search/:searchTerms
 *
 *
 * the updateMarkSearchSettings validation is done in appSettings.js
 *
 * changePagesDBlocation & checkIfFileIsBinary use parse-filepath, so I think they're ok.
 *
 * note: remember if adding anything new, that 'post' in the exec functions can be undefined, so may need
 * to check against that.
 */

function allowedToOpenUrl(urlWantToOpen) {
  return [
      'https://css-tricks.com/prefetching-preloading-prebrowsing/',
      /****
       * The two 'global.msServerAddr.combined' are for when an error has occured
       * importing in the settings and we show a link to the MarkSearch search page
       * so they can try importing the ones that errored manually.
       */
      `${ global.msServerAddr.combined }`,
      `${ global.msServerAddr.combined }/`,
      `https://darkle.github.io/MarkSearch/#help`,
      `https://github.com/Darkle/MarkSearch#help`,
      `https://github.com/Darkle/MarkSearch#setting-up-the-marksearch-browser-extension`,
      `https://github.com/Darkle/MarkSearch#setting-up-the-marksearch-bookmarklet`
    ].indexOf(urlWantToOpen) > -1
}

module.exports = {
  reqParamsSanitization: {
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
      },
      // Knex does its own escaping to prevent sql injection: http://bit.ly/2gjv1gF
      // searchTerms: {
      //   type: 'string',
      //   optional: true,
      //   exec: function(schema, post) {
      //     if(_.isString(post)){
      //       console.log('search terms sanitization')
      //       console.log(SqlString.escape(post))
      //       post = SqlString.escape(post)
      //     }
      //     return post
      //   }
      // }
    }
  },
  reqParamsValidation: {
    type: 'object',
    properties: {
      pageUrl: {
        type: 'string',
        optional: true,
        maxLength: 2000,
        exec: function(scheme, post) {
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
        exec: function(scheme, post) {
          if(_.isString(post)){
            if(!validUrl.isWebUri(post) || !allowedToOpenUrl(post)){
              this.report('req.params.urlToOpen is not a valid web url or is not a url allowed to be opened')
            }
          }
        }
      }
    }
  },
  reqBodySanitization: {
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
      },
      dateFilterStartDate: {
        type: 'integer',
        optional: true,
        exec: function(schema, post) {
          if(!_.isUndefined(post) && !_.isInteger(post)){
            post = _.toInteger(post)
          }
          return post
        }
      },
      dateFilterEndDate: {
        type: 'integer',
        optional: true,
        exec: function(schema, post) {
          if(!_.isUndefined(post) && !_.isInteger(post)){
            post = _.toInteger(post)
          }
          return post
        }
      }
    }
  },
  reqBodyValidation: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        optional: true,
        exec: function(scheme, post) {
          if(_.isString(post) && !validator.isEmail(post)){
            this.report(`req.body.email doesn't seem to be a valid email address`)
          }
        }
      },
      bookmarkletText: {
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
      },
      dateFilterStartDate: {
        type: 'integer',
        optional: true
      },
      dateFilterEndDate: {
        type: 'integer',
        optional: true
      }
    }
  }
}
