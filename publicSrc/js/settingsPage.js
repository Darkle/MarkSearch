'use strict';

import "babel-polyfill" //needs to be first

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  console.log( "settingsPage.js ready!" )
  var csrfToken = $('#csrfInput').val()
  console.log(csrfToken)

//when hiding other subbars, look at what addUrls & dateFilter does when they reset/hide
  //other subbar in the if(currentlyShownSubBar$[0] && currentlyShownSubBar$[0] !== addPageUrlsDiv$[0])
  //and other one

}
