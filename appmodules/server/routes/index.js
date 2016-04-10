'use strict';

var url = require('url')

var express = require('express')
var requireDir = require('require-dir')

var apiModules = requireDir('../api')
var search = require('../api/search/search')
var scrapeAndAddPage = require('../api/scrape/scrapeAndAddPage')
var appSettings = require('../../db/appSettings')
var generateBookmarkletJS = require('../generateBookmarkletJS')
var generateJWTtoken = require('../../utils/generateJWTtoken')
var getAllExpiredBookmarks = require('../bookmarkExpiry').getAllExpiredBookmarks
var appLogger = require('../../utils/appLogger')
var requestDataValidation = require('../requestDataValidation')

var router = express.Router()

router.get('/', (req, res, next) => {
  res.render('searchPage',
      {
        title: 'MarkSearch',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: appSettings.settings.prebrowsing,
              alwaysDisableTooltips: appSettings.settings.alwaysDisableTooltips
            }
        )
      }
  )
})

router.get('/about', (req, res, next) => {
  res.render('aboutPage',
      {
        title: 'MarkSearch About'
      }
  )
})

router.get('/help', (req, res, next) => {
  res.render('helpPage',
      {
        title: 'MarkSearch Help'
      }
  )
})

router.get('/settings', (req, res, next) => {
  res.render('settingsPage',
      {
        title: 'MarkSearch Settings',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(
            {
              prebrowsing: appSettings.settings.prebrowsing,
              pagesDBFilePath: appSettings.settings.pagesDBFilePath,
              alwaysDisableTooltips: appSettings.settings.alwaysDisableTooltips,
              bookmarkExpiryEnabled: appSettings.settings.bookmarkExpiryEnabled,
              bookmarkExpiryEmail: appSettings.settings.bookmarkExpiryEmail,
              bookmarkExpiryMonths: appSettings.settings.bookmarkExpiryMonths
            }
        )
      }
  )
})

/****
 * Don't load the bookmarklet code directly on load as it includes the token.
 * Load the boookmarklet code and token via the frontend api so you need to include
 * the csrf token
 */
router.get('/bookmarklet', (req, res, next) => {
  // var token = generateJWTtoken()
  // var bookmarkletJS = generateBookmarkletJS(global.msServerAddr.combined, token)
  res.render('bookmarkletPage',
      {
        title: 'MarkSearch Bookmarklet',
        csrfToken: req.csrfToken(),
        // bookmarkletHref: `javascript:${encodeURIComponent(bookmarkletJS)}`
      }
  )
})

router.get('/removeOldBookmarks', (req, res, next) => {
  getAllExpiredBookmarks()
    .then(rows => {
      res.render('removeOldBookmarksPage',
        {
          title: 'MarkSearch - Remove Old Bookmarks',
          csrfToken: req.csrfToken(),
          rows: JSON.stringify(rows)
        }
      )
    })
    .catch(err => {
      console.error(err)
      appLogger.log.error({err, req, res})
    })
})

/****
 * Doing it this way so dont have to bother with auth sessions to call the api from the frontend
 * (the api routes are protected by the JWT) and also so need csrf token to be able to call
 * the api from the frontend. (OWASP seems to recommend making them into POST so I guess do that)
 */
router.post('/frontendapi/getall/', requestDataValidation, apiModules.getAllPages)
router.post('/frontendapi/search/:searchTerms', requestDataValidation, search)
router.post('/frontendapi/scrapeAndAdd/:pageUrl', requestDataValidation, scrapeAndAddPage)
router.delete('/frontendapi/remove/:pageUrl', requestDataValidation, apiModules.deletePage)
router.post('/frontendapi/openUrlInBrowser/:urlToOpen', requestDataValidation, apiModules.openUrlInBrowser)
router.post('/frontendapi/settings/update/', requestDataValidation, apiModules.updateMarkSearchSettings)
router.post('/frontendapi/settings/changePagesDBlocation/', requestDataValidation, apiModules.changePagesDBlocation)
router.post('/frontendapi/settings/generateExtToken/', requestDataValidation, apiModules.generateExtToken)
router.post('/frontendapi/settings/emailBookmarklet/', requestDataValidation, apiModules.emailBookmarklet)
router.post('/frontendapi/settings/checkIfFileIsBinary/:filePath', requestDataValidation, apiModules.checkIfFileIsBinary)
router.post('/frontendapi/settings/revokeExtTokens/', requestDataValidation, apiModules.resetJWTsecret)

module.exports = router
