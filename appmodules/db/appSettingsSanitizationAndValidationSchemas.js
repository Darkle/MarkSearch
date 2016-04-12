'use strict';

var _ = require('lodash')
var validator = require('validator')

/****
 * App Settings Validation Schema
 */

module.exports = {
  /****
   * Coerce the true/false/Integer values might get back from frontend as when they send
   * settings via ajax, they are converted to string, so convert back to their proper type.
   *
   * Also, SQLite stores Boolean values as a 0 for false or 1 for true, so convert them to
   * boolean when getting settings from the db, so they are slightly easier to work with.
   *
   * note: remember if adding anything new, that 'post' in the exec functions can be undefined, so may need
   * to check against that.
   */

  appSettingsSanitization: {
    type: 'object',
    properties: {
      prebrowsing: {
        type: 'boolean',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post)){
            if(post === 'true' || post === 1){
              post = true
            }
            if(post === 'false' || post === 0){
              post = false
            }
          }
          return post
        }
      },
      alwaysDisableTooltips: {
        type: 'boolean',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post)){
            if(post === 'true' || post === 1){
              post = true
            }
            if(post === 'false' || post === 0){
              post = false
            }
          }
          return post
        }
      },
      bookmarkExpiryEnabled: {
        type: 'boolean',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post)){
            if(post === 'true' || post === 1){
              post = true
            }
            if(post === 'false' || post === 0){
              post = false
            }
          }
          return post
        }
      },
      bookmarkExpiryMonths: {
        type: 'integer',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post) && !_.isInteger(post)){
            post = _.toInteger(post)
          }
          return post
        }
      },
      bookmarkExpiryLastCheck: {
        type: 'integer',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post) && !_.isInteger(post)){
            post = _.toInteger(post)
          }
          return post
        }
      },
      serverPort: {
        type: 'integer',
        optional: true,
        exec: function(schema, post){
          if(!_.isUndefined(post) && !_.isInteger(post)){
            post = _.toInteger(post)
          }
          return post
        }
      }
    }
  },
  appSettingsValidation: {
    type: 'object',
    strict: true,
    someKeys: [
      'pagesDBFilePath',
      'prebrowsing',
      'alwaysDisableTooltips',
      'bookmarkExpiryEnabled',
      'bookmarkExpiryEmail',
      'bookmarkExpiryMonths',
      'bookmarkExpiryLastCheck',
      'skipUpdateVersion',
      'serverPort'
    ],
    properties: {
      pagesDBFilePath: {
        type: 'string',
        optional: true
      },
      prebrowsing: {
        type: 'boolean',
        optional: true
      },
      alwaysDisableTooltips: {
        type: 'boolean',
        optional: true
      },
      bookmarkExpiryEnabled: {
        type: 'boolean',
        optional: true
      },
      bookmarkExpiryEmail: {
        type: 'string',
        optional: true,
        exec: function(scheme, post){
          if(_.isString(post) && post.length && !validator.isEmail(post)){
            this.report(`bookmarkExpiryEmail doesn't seem to be a valid email address`)
          }
        }
      },
      bookmarkExpiryMonths: {
        type: 'integer',
        eq: [3, 6],
        error: 'bookmarkExpiryMonths must be a an integer of 3 or 6',
        optional: true
      },
      bookmarkExpiryLastCheck: {
        type: 'integer',
        gt: 0,
        error: 'bookmarkExpiryLastCheck must be a valid integer and larger than 0',
        optional: true
      },
      skipUpdateVersion: {
        type: 'string',
        optional: true
      },
      serverPort: {
        type: 'integer',
        gt: 0,
        error: 'serverPort must be a valid integer and larger than 0',
        optional: true
      }
    }
  }
}
