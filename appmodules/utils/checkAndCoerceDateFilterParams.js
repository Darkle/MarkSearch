'use strict';

var _ = require('lodash')

function checkAndCoerceDateFilterParams(requestBody){
  var returnDateFilterData = null
  if(requestBody.dateFilterStartDate && requestBody.dateFilterEndDate){
    returnDateFilterData = {
      dateFilterStartDate: _.toNumber(requestBody.dateFilterStartDate),
      dateFilterEndDate: _.toNumber(requestBody.dateFilterEndDate)
    }
  }
  return returnDateFilterData
}

module.exports = checkAndCoerceDateFilterParams