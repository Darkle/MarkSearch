'use strict';

var _ = require('lodash')

var appSettings = require('../../db/appSettings')

function updateMarkSearchSettings(req, res, next){

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