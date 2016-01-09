'use strict';

function initSearchPlaceholder(searchInput$){
  /****
   * If we're on a small device (e.g. iPhone 4) and there's no
   * Marksearch logo, add some placeholder text to the search
   * box
   */
  if(window.matchMedia("(max-width: 28.6em)").matches) {
    console.log( "(max-width: 28.6em)" )
    searchInput$.attr('placeholder', 'Search MarkSearch')
  }
  else{
    searchInput$.removeAttr('placeholder')
  }
  window.addEventListener("orientationchange", () => {
    if(window.matchMedia("(max-width: 28.6em)").matches) {
      console.log( "(max-width: 28.6em)" )
      searchInput$.attr('placeholder', 'Search MarkSearch')
    }
    else{
      searchInput$.removeAttr('placeholder')
    }
  })
}
/****
 * Exports
 */
export { initSearchPlaceholder }