'use strict';

var _ = require('lodash')

var appSettings = require('../../db/appSettings')
var appLogger = require('../../utils/appLogger')

function updateMarkSearchSettings(req, res, next){

  appSettings.update(req.body)
    .then( () => {
      res.status(200).end()
    })
    .catch( err => {
      console.error(err)
      appLogger.log.error({err})
      var errorMessage = err
      if(!_.isString(errorMessage)){
        errorMessage = JSON.stringify(err.message)
      }
      res.status(500).json({errorMessage: errorMessage})
    })

}

module.exports = updateMarkSearchSettings