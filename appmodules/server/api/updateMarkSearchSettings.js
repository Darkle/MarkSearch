'use strict';

var debug = require('debug')('MarkSearch:updateMarkSearchSettings')

var appSettings = require('../../db/appSettings')

function updateMarkSearchSettings(req, res, next){

  debug("updateMarkSearchSettings")
  //console.log(req.body)

  //TODO - validate req.body
  var reqBody = req.body

  appSettings.update(reqBody)
      .then( () => {
        res.status(200).end()
      })
      .catch( err => {
        console.error(err)
        res.status(500).send(JSON.stringify(err.message))
      })

}

module.exports = updateMarkSearchSettings