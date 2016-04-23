'use strict'

var electron = require('electron')

/****
 * If the default window size is too big for the desktop screen,
 * use the desktop width & height for the window size
 */

function checkScreenSize() {
  var defaultWindowSize = {
    width: 1050,
    height: 1200
  }
  var electronScreen = electron.screen
  var displayScreenSize = electronScreen.getPrimaryDisplay().workAreaSize
  if(displayScreenSize.width < defaultWindowSize.width || displayScreenSize.height < defaultWindowSize.height){
    defaultWindowSize = {
      width: displayScreenSize.width,
      height: displayScreenSize.height
    }
  }
  return defaultWindowSize
}

module.exports = checkScreenSize