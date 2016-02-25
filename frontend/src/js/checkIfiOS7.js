'use strict';

function checkIfiOS7(window){
  /*****
   * old way
   */
  //return (window.screen.height === 480 && window.screen.width === 320 && ('ontouchstart' in window))
  /****
   * New way based on http://stackoverflow.com/a/9039885/3458681
   * More specific to iOS 7 as that is what we should be testing
   * Lets just hope Apple doesn't remove indexedDB from
   * future iOS'
   */
  return /iPad|iPhone|iPod/.test(navigator.platform) && !window.indexedDB
}
/****
 * Exports
 */
export { checkIfiOS7 }