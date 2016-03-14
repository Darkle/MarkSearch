'use strict';

var _ = require('lodash')

var appSettings = require('../../db/appSettings')

function updateMarkSearchSettings(req, res, next){

  console.log('updateMarkSearchSettings')
  console.log(req.body)

  //TODO - validate req.body
  var reqBody = req.body
  appSettings.update(reqBody)
    .then( () => {
      res.status(200).end()
    })
    .catch( err => {
      console.error(err)
      var errorMessage = err
      if(!_.isString(errorMessage)){
        errorMessage = JSON.stringify(err.message)
      }
      res.status(500).json({errorMessage: errorMessage})
    })

}

module.exports = updateMarkSearchSettings