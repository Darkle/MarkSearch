'use strict';

var url = require('url')

var express = require('express')
var requireDir = require('require-dir')

var apiModules = requireDir('../api')
var searchApi = require('../api/search/search')
var scrapeAndAddPage = require('../api/scrape/scrapeAndAddPage')
var appSettings = require('../../db/appSettings')
var generateBookmarkletJS = require('../generateBookmarkletJS')
var generateProtocolIpAndPort = require('../../utils/generateProtocolIpAndPort')
var generateJWTtoken = require('../../utils/generateJWTtoken')

var router = express.Router()

router.get('/', (req, res, next) => {
  res.render('searchPage',
      {
        title: 'MarkSearch',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: Boolean(appSettings.settings.prebrowsing),
              alwaysDisableTooltips: Boolean(appSettings.settings.alwaysDisableTooltips)
            }
        )
      }
  )
})

router.get('/aboutPage', (req, res, next) => {
  res.render('aboutPage',
      {
        title: 'MarkSearch About'
      }
  )
})

router.get('/helpPage', (req, res, next) => {
  res.render('helpPage',
      {
        title: 'MarkSearch Help'
      }
  )
})

router.get('/settingsPage', (req, res, next) => {
  res.render('settingsPage',
      {
        title: 'MarkSearch Settings',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: Boolean(appSettings.settings.prebrowsing),
              pagesDBFilePath: appSettings.settings.pagesDBFilePath,
              alwaysDisableTooltips: Boolean(appSettings.settings.alwaysDisableTooltips)
            }
        )
      }
  )
})

router.get('/bookmarklet', (req, res, next) => {
  var token = generateJWTtoken()
  var protocolIpandPort = generateProtocolIpAndPort(req)
  var bookmarkletJS = generateBookmarkletJS(protocolIpandPort, token)
  res.render('bookmarkletPage',
      {
        title: 'MarkSearch Bookmarklet',
        csrfToken: req.csrfToken(),
        bookmarkletHref: `javascript:${encodeURIComponent(bookmarkletJS)}`
      }
  )
})

/****
 * Doing it this way so dont have to bother with auth sessions to call the api from the frontend
 * (the api routes are protected by the JWT) and also so need csrf token to be able to call
 * the api from the frontend. (OWASP seems to recommend making them into POST so I guess do that)
 */
router.post('/frontendapi/getall/', apiModules.getAllPages)
router.post('/frontendapi/search/:searchTerms', searchApi)
router.post('/frontendapi/scrapeAndAdd/:pageUrl', scrapeAndAddPage)
router.delete('/frontendapi/remove/:pageUrl', apiModules.deletePage)
router.post('/frontendapi/openUrlInBrowser/:urlToOpen', apiModules.openUrlInBrowser)
router.post('/frontendapi/settings/update/', apiModules.updateMarkSearchSettings)
router.post('/frontendapi/settings/changePagesDBlocation/', apiModules.changePagesDBlocation)
router.post('/frontendapi/settings/generateExtToken/', apiModules.generateExtToken)
router.post('/frontendapi/settings/emailBookmarklet/', apiModules.emailBookmarklet)
router.post('/frontendapi/settings/checkIfFileIsBinary/:filePath', apiModules.checkIfFileIsBinary)
router.post('/frontendapi/settings/revokeExtTokens/', apiModules.resetJWTsecret)

module.exports = router
