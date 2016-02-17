'use strict';

var debug = require('debug')('MarkSearch:updateMarkSearchSettings')

var appSettings = require('../../db/appSettings')

function updateMarkSearchSettings(req, res, next){

  debug("settings/update page")
  //console.log(req.body)

  var appDB = req.app.get('appDB')
  var reqBody = req.body

  //TODO - validation goes here

  appSettings.update()

    appDB.updateAsync(
        {
          _id: 'appSettingsDoc'
        },
        {
          $set: {
            [`markSearchSettings.${reqBody.settingKey}`] : reqBody.settingValue
          }
        }
        )
        .then( numberUpdated => appDB.findOneAsync({_id: 'appSettingsDoc'}))
        .then( appSettingsDoc => {
          appDB.persistence.compactDatafile()
          req.app.set('appSettings', appSettingsDoc)
          res.status(200).end()
        })
        .catch( err => {
          console.error(err)
          res.status(500).send(JSON.stringify(err.message))
        })

}

module.exports = updateMarkSearchSettings