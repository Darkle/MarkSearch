'use strict'

/****
 * note: run these via gulp in default cmd.exe when on Windows as opposed to MinGW et.al., as had an issue
 * with MinGW not finding python on Win10 for the sqlite3 build task.
 */


/****
* startDev ('default', 'browserify', 'nodemon', 'browser-sync', 'watch-less', 'watch-js')
* Runs nodemon, browsersync and watch tasks for .less and .js.
* Also runs browserify for the frontend js to be piped through.
*/
require('./gulpTasks/startDev')

/****
* buildSqlite3LibBindings ('sqlite')
* https://github.com/mapbox/node-sqlite3
*
* Build sqlite3 lib bindings against the source that comes with the npm sqlite3 lib, or
* against an externally installed sqlite, as at the moment, the binary downloads
* that come with a regular 'npm install sqlite3' dont include fts5 support.
*
* Install What is required by your OS for node-gyp before running this task.
* https://github.com/nodejs/node-gyp
*
*/
require('./gulpTasks/buildSqlite3LibBindings')

/****
* selfsignElectronForDev ('selfsign')
* Self-sign the electron app for development on OSX so that we dont constantly have to click on
* the allow incomming connections alert that pops up each time we run electron.
* (note: may still need to confirm the accept incomming connections dialog once after this).
* (OSX only).
*/
require('./gulpTasks/selfsignElectronForDev')

/****
* generateRandomDatesForSavedPages ('randomDates')
* Sets random dates to the pages saved in pagesdb.
* This is helpful to check that the dateFilter on the frontend and in the extensions is
* working properly.
* (Only working on OSX atm).
*/
require('./gulpTasks/generateRandomDatesForSavedPages')

/****
 * resetCheckedForExpiryForBookmarkExpiryChecks ('resetCheckedForExpiry')
 * Set checkedForExpiry to false for each row in pagesdb. This is handy for
 * when tweaking bookmarkExpiry or checking that bookmarkExpiry is working.
 * (Only working on OSX atm).
 */
require('./gulpTasks/resetCheckedForExpiryForBookmarkExpiryChecks')

/****
* serverModuleSizes ('serverModuleSizes')
* Uses ndu https://github.com/groupon/ndu
* ndu is a tool for analyzing the size of dependencies in a node.js
* application. It's similar to disc, but for server-side dependencies instead of
* client-side depedencies.
* (Windows not yet supported)
* (Only set to run on OSX atm).
*/
require('./gulpTasks/serverModuleSizes')

/****
 * analyzeFrontendModuleSize ('frontendModuleSize')
 * Uses disc https://github.com/hughsk/disc
 * Disc is a tool for analyzing the module tree of browserify project bundles.
 * It's especially handy for catching large and/or duplicate modules which might be
 * either bloating up your bundle or slowing down the build process.
 * (Only set to run on OSX atm).
 */
require('./gulpTasks/analyzeFrontendModuleSize')

/****
 * alterGotPackageJson ('alterGotPackageJson')
 * This is for in case ever want to switch to got version 6. Would need to
 * use babel to transform it on frontend.
 * https://gist.github.com/Darkle/d44ac3ae27b46e17fe96fd52322c48f4
 */
// require('./gulpTasks/alterGotPackageJson')

/****
 * build.js ('build')
 * Build the app for distribution as an executable.
 * Remove all sourcemap files from css and js.
 * Strip any console calls from the frontend js bundles.
 */
require('./gulpTasks/build')











