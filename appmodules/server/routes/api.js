'use strict';

var path = require('path')

var express = require('express')
var router = express.Router()

var requireDir = require('require-dir')
var apiModules = requireDir(path.join('..', 'api'))

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

/* DELETE - api - remove/delete a page. */
router.delete('/remove/:pageUrl', apiModules.deletePage)

module.exports = router
