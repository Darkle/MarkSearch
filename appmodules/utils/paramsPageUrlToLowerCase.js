'use strict';

var _ = require('lodash')

function paramsPageUrlToLowerCase(req, res, next){
  /****
   * _.isString will also return false if req.params.pageUrl doesn't exist
   */
  if(req.params && _.isString(req.params.pageUrl)){
    req.params.pageUrl = req.params.pageUrl.toLowerCase()
  }
  next()
}

module.exports = paramsPageUrlToLowerCase