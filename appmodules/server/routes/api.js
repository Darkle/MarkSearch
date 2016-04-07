'use strict';

var express = require('express')
var requireDir = require('require-dir')
var _ = require('lodash')

var router = express.Router()
var requestDataValidation = require('../requestDataValidation')
var apiModules = requireDir('../api')
var search = require('../api/search/search')

/****
 * api routes are mostly used by the extensions
 */
router.get('/get/:pageUrl', requestDataValidation, apiModules.getSinglePage)
router.get('/getall/', requestDataValidation, apiModules.getAllPages)
router.get('/search/:searchTerms',  requestDataValidation, search)
/****
 * /api/add/:pageUrl route is used by the extensions as they send all the page data
 * and dont need to use scrapeAndAddPage
 */
router.post('/add/:pageUrl',   requestDataValidation, apiModules.addPage)
router.delete('/remove/:pageUrl', requestDataValidation, apiModules.deletePage)


module.exports = router