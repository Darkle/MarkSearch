'use strict';

var path = require('path')

var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var _ = require('lodash')

var requireDir = require('require-dir')
var apiModules = requireDir(path.join('..', 'appmodules', 'api'))

/* GET home page. */
router.get('/', (req, res, next) => {
  console.log("searchPage page")
  var appSettings = req.app.get('appSettings')
  var marsearchSettingsObjCopy = _.pick(appSettings, 'markSearchSettings')
  res.render('searchPage',
      {
        title: 'MarkSearch',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(marsearchSettingsObjCopy.markSearchSettings)
      }
  )
})

/****
 * Doing this so need csrf token to be able to call the api's. (OWASP seems
 * to recommend making them into POST)
 */
router.post('/indexPage_getall/', apiModules.getAllPages)
router.post('/indexPage_search/:searchingLoose/:searchTerms', apiModules.search)
router.post('/indexPage_scrapeAndAdd/:pageUrl', apiModules.scrapeAndAddPage)
router.delete('/indexPage_remove/:pageUrl', apiModules.deletePage)

/* GET about page. */
router.get('/about', (req, res, next) => {
  console.log("about page")
  res.render('about',
      {
        title: 'MarkSearch About'
      }
  )
})

/* GET help page. */
router.get('/help_about', (req, res, next) => {
  console.log("help_about page")
  res.render('help_about',
      {
        title: 'MarkSearch Help'
      }
  )
})

/* GET settings page. */
router.get('/settingsPage', (req, res, next) => {
  console.log("settings page")
  var appSettings = req.app.get('appSettings')
  var marsearchSettingsObjCopy = _.pick(appSettings, 'markSearchSettings')
  res.render('settingsPage',
      {
        title: 'MarkSearch Settings',
        csrfToken: req.csrfToken(),
        markSearchSettings: JSON.stringify(marsearchSettingsObjCopy.markSearchSettings)
      }
  )
})

router.post('/settings/update', (req, res, next) => {
  /****
   * make sure this is using the CSRF token
   * so with this we are changing the appDB.markSearchSettings
   * remember to save appDB changes back to disk - do i need to do this? does nedb
   * do this automatically? doubel check - AND also update the app.set('appSettings'
   */
  console.log("settings/update page")


})

router.post('/settings/generateJWTExtensionToken', (req, res, next) => {
  console.log("settings/generateJWTExtensionToken+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
  /****
   * Give it a somewhat unique id. Could be helpful for logging which client
   * is accessing the api.
   */
  var token = jwt.sign(
      {
        client: `browserExtension_${parseInt((Math.random() * 100), 10)}`
      },
      req.app.get('JWTsecret')
  )
  res.json({token: token})
})

router.post('/settings/generateJWTBookmarkletToken', (req, res, next) => {
  console.log("settings/generateJWTBookmarkletToken")
  //remember to add a random number to the sub, say {client: “bookmarklet_21312”}
})

module.exports = router
