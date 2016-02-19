'use strict';

var express = require('express')
var requireDir = require('require-dir')
var _ = require('lodash')

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


/*****
 * Temp, delete
 */
//var pagesdb = require('../../db/pagesdb')
//router.post('/tempo/updateColumn', function(req, res, next){
//  pagesdb.updateColumn(req.body)
//})
//router.post('/tempo/upsertRow', function(req, res, next){
//  pagesdb.upsertRow(req.body)
//})

module.exports = router
