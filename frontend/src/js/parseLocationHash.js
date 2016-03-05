'use strict';

import { hash } from './locationHashParserLib'

import _ from 'lodash'

function parseLocationHash(){
  var locationHashData = hash()

  if(_.isEmpty(locationHashData)){
    return null
  }

  console.log(locationHashData)

  var unencodedSearchTerms = null
  var searchTerms = _.trim(_.get(locationHashData, 'searchTerms', null))

  if(!_.trim(searchTerms).length){
    searchTerms = null
  }
  else{
    unencodedSearchTerms = decodeURIComponent(searchTerms)
  }

  var dateFilter = null
  var dateFilterStartDate = _.toInteger(_.get(locationHashData, 'dateFilterStartDate', null))
  var dateFilterEndDate = _.toInteger(_.get(locationHashData, 'dateFilterEndDate', null))

  if(!!dateFilterStartDate && !!dateFilterEndDate){
    dateFilter = {
      dateFilterStartDate,
      dateFilterEndDate
    }
  }

  return {
    searchTerms,
    dateFilter,
    unencodedSearchTerms
  }

}

export { parseLocationHash }