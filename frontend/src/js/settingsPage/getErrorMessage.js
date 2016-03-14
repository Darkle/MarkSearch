'use strict';

import _ from 'lodash'

function getErrorMessage(err){
  var errorMessage = _.get(err, 'message')
  var responseBody = _.trim(_.get(err, 'response.body'))
  var parsedResponseBody
  if(responseBody.length){
    try{
      parsedResponseBody = JSON.parse(responseBody)
    }
    catch(e){}
  }
  if(_.get(parsedResponseBody, 'errorMessage')){
    errorMessage = parsedResponseBody.errorMessage
  }
  return errorMessage
}

export { getErrorMessage }