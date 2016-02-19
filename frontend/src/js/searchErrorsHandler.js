'use strict';

import _ from 'lodash'
require('lodash-migrate')

function searchErrorHandler(error){
  console.error(error)
  /*****
   * If Forbidden/Unauthorized, prolly an issue with csrf
   */
  if(_.get(error, 'response.statusCode') === 403){
    console.log(403)
    /****
     * reload to get a new csurf & don't use cache (true)
     */
    window.location.reload(true)
  }
}
/****
 * Exports
 */
export { searchErrorHandler }