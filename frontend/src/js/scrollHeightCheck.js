'use strict'

function scrollHeightCheck(win, doc, padding) {
  return $(win).scrollTop() >= ( ($(doc).height() - $(win).height()) - padding)
}
/****
 * Exports
 */
export { scrollHeightCheck }