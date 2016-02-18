'use strict';

var express = require('express')
var requireDir = require('require-dir')

var router = express.Router()
var apiModules = requireDir('../api')

router.get('/get/:pageUrl', apiModules.getSinglePage)
router.get('/getall/', apiModules.getAllPages)
router.get('/search/:searchTerms', apiModules.search)
/****
 * /add/:pageUrl is used by the extensions as they send all the page data
 * and dont need to use scrapeAndAddPage
 */
router.post('/add/:pageUrl', apiModules.addPage)
router.delete('/remove/:pageUrl', apiModules.deletePage)

module.exports = router
