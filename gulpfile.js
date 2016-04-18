'use strict';


/****
* startDev ('default', 'browserify', 'nodemon', 'browser-sync', 'watch-less', 'watch-js')
* Runs nodemon, browsersync and watch tasks for .less and .js.
* Also runs browserify for the frontend js to be piped through.
*/
require('./gulpTasks/startDev')

/****
* buildSqlite3LibBindings ('sqlite', 'sqliteSymlink')
* https://github.com/mapbox/node-sqlite3
* Need to build sqlite3 js library binding (libsqlite3) from source as the default one
* that comes with the sqlite3 js library does not include support for the full text
* search (fts5) in SQLite.
*
* Install What is required by your OS for node-gyp before running this task.
* https://github.com/nodejs/node-gyp
*/
require('./gulpTasks/buildSqlite3LibBindings')

/****
* selfsignElectronForDev ('selfsign')
* Self-sign the electron app for development so that we dont constantly have to click on
* the allow incomming connections alert that pops up each time we run electron.
* (note: may still need to confirm the accept incomming connections dialog once after this).
*/
require('./gulpTasks/selfsignElectronForDev')

/****
* generateRandomDatesForSavedPages ('randomDates')
* Sets random dates to the pages saved in pagesdb.
* This is helpful to check that the dateFilter on the frontend and in the extensions is
* working properly.
*/
require('./gulpTasks/generateRandomDatesForSavedPages')

/****
 * resetCheckedForExpiryForBookmarkExpiryChecks ('resetCheckedForExpiry')
 * Set checkedForExpiry to false for each row in pagesdb. This is handy for
 * when tweaking bookmarkExpiry or checking that bookmarkExpiry is working.
 */
require('./gulpTasks/resetCheckedForExpiryForBookmarkExpiryChecks')

/****
* serverModuleSizes ('serverModuleSizes')
* Uses ndu https://github.com/groupon/ndu
* ndu is a tool for analyzing the size of dependencies in a node.js
* application. It's similar to disc, but for server-side dependencies instead of
* client-side depedencies.
* (Windows not yet supported)
*/
require('./gulpTasks/serverModuleSizes')

/****
 * analyzeFrontendModuleSize ('frontendModuleSize')
 * Uses disc https://github.com/hughsk/disc
 * Disc is a tool for analyzing the module tree of browserify project bundles.
 * It's especially handy for catching large and/or duplicate modules which might be
 * either bloating up your bundle or slowing down the build process.
 */
require('./gulpTasks/analyzeFrontendModuleSize')

/****
 * alterGotPackageJson ('alterGotPackageJson')
 * This is for in case ever want to switch to got version 6. Would need to
 * use babel to transform it on frontend.
 * https://gist.github.com/Darkle/d44ac3ae27b46e17fe96fd52322c48f4
 */
// require('./gulpTasks/alterGotPackageJson')











