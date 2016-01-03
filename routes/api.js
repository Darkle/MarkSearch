'use strict';

var path = require('path')

var express = require('express')
var router = express.Router()

var requireDir = require('require-dir')
var apiModules = requireDir(path.join('..', 'appmodules', 'api'))

/* GET - api - get a single page. */
router.get('/get/:pageUrl', function validation(){
  //do something and error or call next()
}, apiModules.getSinglePage)

/* GET - api - get all pages. */
router.get('/getall/', apiModules.getAllPages)

/* GET - api - search. */
router.get('/search/:searchingLoose/:searchTerms', apiModules.search)

/****
 * POST - api - add a page.
 * apiModules.addPage is used by the extensions as they send all the page data
 * and dont need Marksearch backend to scrape
 */
router.post('/add/:pageUrl', apiModules.addPage)

/****
 * POST - api - scrape page.
 * apiModules.scrapeAndAddPage is used by the MarkSearch rendered html page
 * to add links to be scraped and saved to MarkSearch database
 * I guess dont need this in api.js as its only called in index.js by MarkSearch page
 */
//router.post('/scrapeAndAdd/', apiModules.scrapeAndAddPage)

/* DELETE - api - remove/delete a page. */
router.delete('/remove/:pageUrl', apiModules.deletePage)

module.exports = router
