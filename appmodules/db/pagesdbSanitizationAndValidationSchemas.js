'use strict';

var url = require('url')

var validUrl = require('valid-url')
var _ = require('lodash')

/****
 * Pages Db upsertRow Sanitization
 *
 * For the upsertRowSanitization & upsertRowValidation, they are all
 * required (none optional).
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
 * note: we dont use 'strict: true' for the upsertRowSanitization as we are
 * not sanitizing every object key.
 * 
 * note: remember if adding anything new, that 'post' in the exec functions can be undefined, so may need
 * to check against that.
 */

module.exports = {
  upsertRowSanitization: {
    type: 'object',
    properties: {
      pageUrl: {
        type: 'string',
        exec: function(schema, post){
          if(_.isString(post)){
            post = url.parse(post).href
          }
          return post
        }
      },
      dateCreated: {
        type: 'integer',
        exec: function(schema, post){
          if(_.isString(post)){
            post = _.toInteger(post)
          }
          return post
        }
      },
      safeBrowsing: {
        type: ['string', 'null'],
        exec: function(schema, post){
          if(!_.isNull(post) && _.isObject(post)){
            post = JSON.stringify(post)
          }
          return post
        }
      }
    }
  },
  /****
   * Pages Db upsertRow Validation
   */
  upsertRowValidation: {
    type: 'object',
    strict: true,
    properties: {
      pageUrl: {
        type: 'string',
        maxLength: 2000,
        exec: function(scheme, post){
          if(_.isString(post) && !validUrl.isWebUri(post)){
            this.report('pageUrl is not a valid web url!')
          }
        }
      },
      dateCreated: {
        type: 'integer',
        gt: 0,
        error: 'dateCreated must be a valid integer and larger than 0'
      },
      pageDomain: {
        type: ['string']
      },
      pageTitle: {
        type: ['string', 'null']
      },
      pageText: {
        type: ['string', 'null']
      },
      pageDescription: {
        type: ['string', 'null']
      },
      archiveLink: {
        type: ['string', 'null'],
        maxLength: 2000,
        exec: function(scheme, post){
          if(_.isString(post) && !validUrl.isWebUri(post)){
            this.report('archiveLink is not a valid web url!')
          }
        }
      },
      safeBrowsing: {
        type: ['string', 'null']
      }
    }
  },
  /****
   * Pages Db updateColumn Sanitization
   *
   * The updateColumnValidation is slightly different as it doesn't
   * always have data for every column.
   *
   * note: we dont use 'strict: true' for the updateColumnSanitization as we are
   * not sanitizing every object key.
   *
   * not 100% certain i need to sanitize/convert dateCreated
   */
  updateColumnSanitization: {
    type: 'object',
    properties: {
      pageUrl: {
        type: 'string',
        exec: function(schema, post){
          if(_.isString(post)){
            post = url.parse(post).href
          }
          return post
        }
      },
      // dateCreated: {
      //   type: 'integer',
      //   optional: true,
      //   exec: function(schema, post){
      //     if(_.isString(post)){
      //       post = _.toInteger(post)
      //     }
      //     return post
      //   }
      // },
      safeBrowsing: {
        optional: true,
        type: ['string', 'null'],
        exec: function(schema, post){
          if(!_.isNull(post) && _.isObject(post)){
            post = JSON.stringify(post)
          }
          return post
        }
      }
    }
  },
  /****
   * Pages Db updateColumn Validation
   *
   * The updateColumnValidation is slightly different as it doesn't
   * always have data for every column.
   */
  updateColumnValidation: {
    type: 'object',
    strict: true,
    someKeys: [
      'pageUrl',
      'dateCreated',
      'pageDomain',
      'pageTitle',
      'pageText',
      'pageDescription',
      'archiveLink',
      'safeBrowsing',
      'checkedForExpiry'
    ],
    properties: {
      pageUrl: {
        type: 'string',
        maxLength: 2000,
        exec: function(scheme, post){
          if(_.isString(post) && !validUrl.isWebUri(post)){
            this.report('pageUrl is not a valid web url!')
          }
        }
      },
      dateCreated: {
        type: 'integer',
        optional: true,
        gt: 0,
        error: 'dateCreated must be a valid integer and larger than 0'
      },
      pageDomain: {
        type: ['string'],
        optional: true
      },
      pageTitle: {
        type: ['string', 'null'],
        optional: true
      },
      pageText: {
        type: ['string', 'null'],
        optional: true
      },
      pageDescription: {
        type: ['string', 'null'],
        optional: true
      },
      archiveLink: {
        type: ['string', 'null'],
        optional: true,
        maxLength: 2000,
        exec: function(scheme, post){
          if(_.isString(post) && !validUrl.isWebUri(post)){
            this.report('archiveLink is not a valid web url!')
          }
        }
      },
      safeBrowsing: {
        type: ['string', 'null'],
        optional: true
      },
      checkedForExpiry: {
        type: 'boolean',
        optional: true
      },
    }
  }
}