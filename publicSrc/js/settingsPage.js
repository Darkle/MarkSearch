'use strict';

import "babel-polyfill" //needs to be first

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  var csrfToken = $('#csrfInput').val()
  console.log(csrfToken)
  //formplate($('body'))


}
