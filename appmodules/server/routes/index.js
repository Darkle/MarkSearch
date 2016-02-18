'use strict';

var express = require('express')
var debug = require('debug')('MarkSearch:routes index')
var requireDir = require('require-dir')

var apiModules = requireDir('../api')
var scrapeAndAddPage = require('../api/scrape/scrapeAndAddPage')
var appSettings = require('../../db/appSettings')

var router = express.Router()

/* GET home page. */
router.get('/', (req, res, next) => {
  debug("searchPage page")
  res.render('searchPage',
      {
        title: 'MarkSearch',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: appSettings.settings.prebrowsing
            }
        )
      }
  )
})

/* GET about page. */
router.get('/about', (req, res, next) => {
  debug("about page")
  res.render('about',
      {
        title: 'MarkSearch About'
      }
  )
})

/* GET help page. */
router.get('/help', (req, res, next) => {
  debug("help page")
  res.render('help',
      {
        title: 'MarkSearch Help'
      }
  )
})

/* GET settings page. */
router.get('/settingsPage', (req, res, next) => {
  debug("settings page")
  res.render('settingsPage',
      {
        title: 'MarkSearch Settings',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: appSettings.settings.prebrowsing
            }
        )
      }
  )
})

/****
 * Doing it this way so dont have to bother with auth sessions to call the api from the frontend
 * (the api routes are protected by the JWT) and also so need csrf token to be able to call
 * the api from the frontend. (OWASP seems to recommend making them into POST so I guess do that)
 */
router.post('/frontendapi/getall/', apiModules.getAllPages)
router.post('/frontendapi/search/:searchTerms', apiModules.search)
router.post('/frontendapi/scrapeAndAdd/:pageUrl', scrapeAndAddPage)
router.delete('/frontendapi/remove/:pageUrl', apiModules.deletePage)
router.post('/frontendapi/settings/update/', apiModules.updateMarkSearchSettings)
router.post('/frontendapi/settings/changePagesDBlocation/', apiModules.changePagesDBlocation)
router.post('/frontendapi/settings/generateExtToken/', apiModules.generateExtToken)


module.exports = router
