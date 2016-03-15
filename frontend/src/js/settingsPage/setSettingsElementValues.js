'use strict';

/* globals markSearchSettings: true */

import {
  dbLocationInfoTitle$,
  prebrowsingCheckbox$,
  alwaysDisableTooltipsCheckbox$,
  bookmarkExpiryCheckbox$,
  bookmarkExpiryEmail$,
  bookmarkExpirySelectMonths$,
  dbLocationText$
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
  //TODO - double check the .slice(0, -19) works ok on windows & linux
  dbLocationText$.text(markSearchSettings.pagesDBFilePath.slice(0, -19))
  if(markSearchSettings.bookmarkExpiryEnabled){
    bookmarkExpiryCheckbox$.prop('checked', true)
    bookmarkExpiryCheckbox$.parent().addClass('checked')
  }
  bookmarkExpiryEmail$.val(markSearchSettings.bookmarkExpiryEmail)
  bookmarkExpirySelectMonths$.val(markSearchSettings.bookmarkExpiryMonths)
}

export { setSettingsElementValues }