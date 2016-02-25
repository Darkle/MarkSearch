'use strict';

import { resultsCountDiv$ } from './searchPage'

function updateResultsCountDiv(resultsCount){
  resultsCountDiv$.text(`${resultsCount} Results`).removeClass('visibilityHidden')
}

export { updateResultsCountDiv }