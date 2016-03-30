'use strict';

var express = require('express')
var requireDir = require('require-dir')
var _ = require('lodash')

var router = express.Router()
var requestDataValidation = require('../../utils/requestDataValidation')
var apiModules = requireDir('../api')
var search = require('../api/search/search')

/****
 * api routes are mostly used by the extensions
 */
router.get('/get/:pageUrl', (req, res, next) => {
  apiModules.getSinglePage(requestDataValidation(req), res, next)
})
router.get('/getall/', apiModules.getAllPages)
router.get('/search/:searchTerms',  (req, res, next) => {
  search(requestDataValidation(req), res, next)
})
/****
 * /api/add/:pageUrl route is used by the extensions as they send all the page data
 * and dont need to use scrapeAndAddPage
 */
router.post('/add/:pageUrl',   (req, res, next) => {
  apiModules.addPage(requestDataValidation(req), res, next)
})
router.delete('/remove/:pageUrl', apiModules.deletePage)


module.exports = router