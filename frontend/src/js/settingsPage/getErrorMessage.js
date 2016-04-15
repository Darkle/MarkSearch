'use strict'

import _ from 'lodash'

function getErrorMessage(err) {
  var errorMessage = _.get(err, 'message')
  var responseBody = _.trim(_.get(err, 'response.body'))
  var parsedResponseBody
  if(responseBody.length){
    try{
      parsedResponseBody = JSON.parse(responseBody)
    }
    catch(e){
      // do nothing
    }
  }
  if(_.get(parsedResponseBody, 'errorMessage')){
    errorMessage = parsedResponseBody.errorMessage
  }
  else if(_.get(parsedResponseBody, 'errMessage')){
    errorMessage = parsedResponseBody.errMessage
  }
  return errorMessage
}

export { getErrorMessage }