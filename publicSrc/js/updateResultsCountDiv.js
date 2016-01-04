'use strict';

import { resultsCountDiv$ } from './searchPage'

function updateResultsCountDiv(resultsCount){
  resultsCountDiv$.text(`${resultsCount} Results`).removeClass('hide')
}

export { updateResultsCountDiv }