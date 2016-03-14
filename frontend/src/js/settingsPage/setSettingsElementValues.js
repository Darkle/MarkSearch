'use strict';

/* globals markSearchSettings: true */

import {
  dbLocationInfoTitle$,
  prebrowsingCheckbox$,
  alwaysDisableTooltipsCheckbox$,
  bookmarkExpiryCheckbox$
} from './settingsPage'

function setSettingsElementValues(){
  dbLocationInfoTitle$.text('Current Database Location:')
  if(markSearchSettings.prebrowsing){
    prebrowsingCheckbox$.prop('checked', true)
    prebrowsingCheckbox$.parent().addClass('checked')
  }
  if(markSearchSettings.alwaysDisableTooltips){
    alwaysDisableTooltipsCheckbox$.prop('checked', true)
    alwaysDisableTooltipsCheckbox$.parent().addClass('checked')
  }
  //TODO set the bookmarkExpiryEnabled, bookmarkExpiryMonths on the page & bookmarkExpiryEmail (the elements valuse i mean)
  if(markSearchSettings.bookmarkExpiryEnabled){
    bookmarkExpiryCheckbox$.prop('checked', true)
    bookmarkExpiryCheckbox$.parent().addClass('checked')
  }
  //markSearchSettings.bookmarkExpiryMonths
  //markSearchSettings.bookmarkExpiryEnabled
}

export { setSettingsElementValues }