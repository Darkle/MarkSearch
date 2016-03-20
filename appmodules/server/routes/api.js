'use strict';

var express = require('express')
var requireDir = require('require-dir')
var _ = require('lodash')

var router = express.Router()
var apiModules = requireDir('../api')
var searchApi = require('../api/search/search')

router.get('/get/:pageUrl', apiModules.getSinglePage)
router.get('/getall/', apiModules.getAllPages)
router.get('/search/:searchTerms', searchApi)
/****
 * /add/:pageUrl is used by the extensions as they send all the page data
 * and dont need to use scrapeAndAddPage
 */
router.post('/add/:pageUrl', apiModules.addPage)
router.delete('/remove/:pageUrl', apiModules.deletePage)


module.exports = router
