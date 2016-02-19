'use strict';

var debug = require('debug')('MarkSearch:updateMarkSearchSettings')
var _ = require('lodash')
require('lodash-migrate')

var appSettings = require('../../db/appSettings')

function updateMarkSearchSettings(req, res, next){

  debug("updateMarkSearchSettings")
  //console.log(req.body)

  //TODO - validate req.body
  var reqBody = req.body
  var settingsObj = _.mapValues(reqBody, val => {
    if(val === 'false'){
      val = false
    }
    if(val === 'true'){
      val = true
    }
    return val
  })
  console.log(settingsObj)
  appSettings.update(settingsObj)
      .then( () => {
        res.status(200).end()
      })
      .catch( err => {
        console.error(err)
        res.status(500).send(JSON.stringify(err.message))
      })

}

module.exports = updateMarkSearchSettings