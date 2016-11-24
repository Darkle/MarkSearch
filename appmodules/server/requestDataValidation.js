'use strict'

var inspector = require('schema-inspector')
var _ = require('lodash')

var appLogger = require('./../utils/appLogger')
var schemas = require('./requestDataValidationAndSanitizationSchema')

function requestDataValidation(req, res, next) {

  /****
   * For some reason the req.body prototype (__proto__) is set to null when it has values, which messes up the
   * schema-inspector's inspector.validate for the req.body. It generates the following error: http://bit.ly/2aCxtd2
   * and seems to break on this line here in the code: http://bit.ly/2aCxGgw
   *
   * I'm not sure why it is happening, so for now, I'm just going to use lodash to copy the key/values to a new
   * object with a proper prototype and then assign the sanitized object back to the req.body & req.params.
   *
   * note: {} is equivalent to: Object.create(Object.prototype)
   *
   * I guess do it for req.params as well.
   *
   * Maybe related: https://github.com/expressjs/express/issues/2613
   */

  var reqBody = _.assign({}, req.body)
  var reqParams = _.assign({}, req.params)

  inspector.sanitize(schemas.reqParamsSanitization, reqParams)
  inspector.sanitize(schemas.reqBodySanitization, reqBody)

  req.body = reqBody
  req.params = reqParams

  var validReqParams = inspector.validate(schemas.reqParamsValidation, reqParams)
  if(!validReqParams.valid){
    let errMessage = `Error(s) with the reqParams data in requestDataValidation : ${ validReqParams.format() }`
    let err = new Error(errMessage)
    global.devMode && console.error(errMessage)
    appLogger.log.error({err, req, res})
    return res.status(500).json({errMessage})
  }

  var validReqBody = inspector.validate(schemas.reqBodyValidation, reqBody)
  if(!validReqBody.valid){
    let errMessage = `Error(s) with the reqBody data in requestDataValidation : ${ validReqBody.format() }`
    let err = new Error(errMessage)
    global.devMode && console.error(errMessage)
    appLogger.log.error({err, req, res})
    return res.status(500).json({errMessage})
  }

  if(validReqParams.valid && validReqBody.valid){
    return next()
  }
}

module.exports = requestDataValidation
