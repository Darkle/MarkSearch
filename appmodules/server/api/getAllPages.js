'use strict';



I could probably use a stored query since getAllPages will never change its query
also remember to grab the ordered index instead of the regular table if end up using
an index



var _ = require('lodash')
var debug = require('debug')('MarkSearch:getAllPages')

function getAllPages(req, res, next) {
  debug('getAllPages running')


}

module.exports = getAllPages