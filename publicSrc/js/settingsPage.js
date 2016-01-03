'use strict';

import "babel-polyfill" //this needs to be first I think

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  var csrfToken = $('#csrfInput').val()
  console.log(csrfToken)



}
