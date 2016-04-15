'use strict'

var inspector = require('schema-inspector')

var appLogger = require('./../utils/appLogger')
var schemas = require('./requestDataValidationAndSanitizationSchema')

function requestDataValidation(req, res, next) {

  inspector.sanitize(schemas.reqParamsSanitization, req.params)
  inspector.sanitize(schemas.reqBodySanitization, req.body)

  var validReqParams = inspector.validate(schemas.reqParamsValidation, req.params)
  if(!validReqParams.valid){
    let errMessage = `Error(s) with the req.params data in requestDataValidation : ${ validReqParams.format() }`
    let err = new Error(errMessage)
    console.error(errMessage)
    appLogger.log.error({err, req, res})
    res.status(500).json({errMessage})
    return
  }

  var validReqBody = inspector.validate(schemas.reqBodyValidation, req.body)
  if(!validReqBody.valid){
    let errMessage = `Error(s) with the req.body data in requestDataValidation : ${ validReqBody.format() }`
    let err = new Error(errMessage)
    console.error(errMessage)
    appLogger.log.error({err, req, res})
    return res.status(500).json({errMessage})
  }

  if(validReqParams.valid && validReqBody.valid){
    return next()
  }

}

module.exports = requestDataValidation