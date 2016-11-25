'use strict'

import _ from 'lodash'

function getErrorMessage(err) {
  /*****
  * Yeah this is bad
  */
  var errorMessage = ''
  var errorMessageOnErrorObject = _.get(err, 'message')
  var errorMessageVersion1 = _.get(err, 'response.data.errorMessage')
  var errorMessageVersion2 =_.get(err, 'response.data.errMessage')
  if(errorMessageVersion1 && errorMessageVersion1.length){
    errorMessage = errorMessageVersion1
  }
  else if(errorMessageVersion2 && errorMessageVersion2.length){
    errorMessage = errorMessageVersion2
  }
  else if(errorMessageOnErrorObject && errorMessageOnErrorObject.length){
    errorMessage = errorMessageOnErrorObject
  }
  return errorMessage
}

export { getErrorMessage }
