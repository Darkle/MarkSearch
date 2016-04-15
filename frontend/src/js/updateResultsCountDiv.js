'use strict'

import { resultsCountDiv$ } from './searchPage'

import _ from 'lodash'

function updateResultsCountDiv(resultsCountOrErrorMessage) {
  var resultsCountText = `${ resultsCountOrErrorMessage } Results`
  if(_.isObject(resultsCountOrErrorMessage)){
    resultsCountText = _.get(resultsCountOrErrorMessage, 'searchError')
  }
  resultsCountDiv$.text(resultsCountText).removeClass('visibilityHidden')
}

export { updateResultsCountDiv }