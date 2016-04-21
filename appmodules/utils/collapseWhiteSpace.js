'use strict'

function collapseWhiteSpace(text) {
  /****
   * from https://github.com/jprichardson/string.js/blob/master/dist/string.js#L191
   */
  return text.replace(/[\s\xa0]+/g, ' ').replace(/^\s+|\s+$/g, '')
}

module.exports = collapseWhiteSpace