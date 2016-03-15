'use strict';

/* globals markSearchSettings: true */

import {
  dbLocationInfoTitle$,
  prebrowsingCheckbox$,
  alwaysDisableTooltipsCheckbox$,
  bookmarkExpiryCheckbox$,
  bookmarkExpiryEmail$,
  bookmarkExpirySelectMonths$
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
  if(markSearchSettings.bookmarkExpiryEnabled){
    bookmarkExpiryCheckbox$.prop('checked', true)
    bookmarkExpiryCheckbox$.parent().addClass('checked')
  }
  bookmarkExpiryEmail$.val(markSearchSettings.bookmarkExpiryEmail)
  bookmarkExpirySelectMonths$.val(markSearchSettings.bookmarkExpiryMonths)
}

export { setSettingsElementValues }