'use strict';

var path = require('path')

var Promise = require("bluebird")
var NedbStore = require('nedb')
var electron = require('electron')

Promise.promisifyAll(NedbStore.prototype)
var appDataPath = path.join(electron.app.getPath('appData'), 'MarkSearch')

/****
 * Not gonna bother using sqlite for expired bookmarks, just gonna use
 * a flat file db.
 */

var bookmarkExpiry = {}

bookmarkExpiry.init = () => {
  var weeklyExpiredBookmarks = new NedbStore(
    {
      filename: path.join(appDataPath, 'weeklyExpiredBookmarks.db'),
      autoload: true
    }
  )
  return weeklyExpiredBookmarks.findOneAsync({_id: 'weeklyExpiredBookmarks'})
    .then(returnedDoc => {
      if(!returnedDoc){
        var doc = {
          _id: 'weeklyExpiredBookmarks',
          expiredBookmarksAlreadyChecked: {},
          thisWeeksBookmarksToShow: []
        }
        return weeklyExpiredBookmarks.insertAsync(doc)
      }
    })
    .then(() => {
      do a check once an hour
      setTimeout()
      set next tick?
        set interval? prolly not
    })
}

bookmarkExpiry.shouldWeRunBookmarkExpiryCheck = () => {

}

bookmarkExpiry.getThisWeeksExpiredBookmarks = () => {

}

module.exports = bookmarkExpiry