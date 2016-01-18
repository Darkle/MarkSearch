'use strict';

var path = require('path')

var express = require('express')
var router = express.Router()
var jwt = require('jsonwebtoken')
var _ = require('lodash')

var requireDir = require('require-dir')
var apiModules = requireDir(path.join('..', 'api'))

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

///* GET about page. */
//router.get('/about', (req, res, next) => {
//  console.log("about page")
//  res.render('about',
//      {
//        title: 'MarkSearch About'
//      }
//  )
//})
//
///* GET help page. */
//router.get('/help_about', (req, res, next) => {
//  console.log("help_about page")
//  res.render('help_about',
//      {
//        title: 'MarkSearch Help'
//      }
//  )
//})

///* GET settings page. */
//router.get('/settingsPage', (req, res, next) => {
//  console.log("settings page")
//  var appSettings = req.app.get('appSettings')
//  var marsearchSettingsObjCopy = _.pick(appSettings, 'markSearchSettings')
//  res.render('settingsPage',
//      {
//        title: 'MarkSearch Settings',
//        csrfToken: req.csrfToken(),
//        markSearchSettings: JSON.stringify(marsearchSettingsObjCopy.markSearchSettings)
//      }
//  )
//})
//
//router.post('/settings/update', (req, res, next) => {
//
//  console.log("settings/update page")
//  console.log(req.body)
//
//  var appDB = req.app.get('appDB')
//  var reqBody = req.body
//
//  //TODO - validation goes here
//
//  ;( (reqBody) => {
//    appDB.updateAsync(
//        {
//          _id: 'appSettingsDoc'
//        },
//        {
//          $set: {
//            [`markSearchSettings.${reqBody.settingKey}`] : reqBody.settingValue
//          }
//        }
//    )
//    .then( numberUpdated => appDB.findOneAsync({_id: 'appSettingsDoc'}))
//    .then( appSettingsDoc => {
//      appDB.persistence.compactDatafile()
//      req.app.set('appSettings', appSettingsDoc)
//      res.status(200).end()
//    })
//    .catch( err => {
//      console.error(err)
//      res.status(500).send(JSON.stringify(err.message))
//    })
//  })(reqBody)
//
//})
//
//router.post('/settings/changePagesDBlocation', (req, res, next) => {
//
//  //TODO - validation goes here
//
//})
//
//router.post('/settings/generateJWTExtensionToken', (req, res, next) => {
//  console.log("settings/generateJWTExtensionToken+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
//  /****
//   * Give it a somewhat unique id - could be helpful for debugging, so
//   * can see which client is accessing the api.
//   */
//  var token = jwt.sign(
//      {
//        client: `browserExtension_${parseInt((Math.random() * 100), 10)}`
//      },
//      req.app.get('JWTsecret')
//  )
//  res.json({token: token})
//})
//
//router.post('/settings/generateJWTBookmarkletToken', (req, res, next) => {
//  console.log("settings/generateJWTBookmarkletToken")
//  var token = jwt.sign(
//      {
//        client: `bookmarklet_${parseInt((Math.random() * 100), 10)}`
//      },
//      req.app.get('JWTsecret')
//  )
//  res.json({token: token})
//})

module.exports = router
