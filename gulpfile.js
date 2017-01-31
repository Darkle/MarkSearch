'use strict'

/**
 * note: run these via gulp in default cmd.exe when on Windows as opposed to MinGW et.al., as had an issue
 * with MinGW not finding python on Win10 for the sqlite3 build task.
 *
 * Also, remember to run `bower install`, `npm install` and `gulp buildSqlite` before running startDev for the first time.
 * first time.
 */


/****
* startDev ('default', 'browserify', 'nodemon', 'browser-sync', 'watch-less', 'watch-js')
* Runs nodemon, browsersync and watch tasks for .less and .js.
* Also runs browserify for the frontend js to be piped through.
*/
require('./gulpTasks/startDev')

/*****
* NOTE: we dont manually build the sqlite bindings any more as we now use the electron-rebuild package
* which is triggered in the npm task. We also use the default sqlite3 install as it now uses FTS5.
*/

/****
* buildSqlite3LibBindings ('buildSqlite')
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
// require('./gulpTasks/buildSqlite3LibBindings')

/****
 * buildSqlite3LibBindingsForRandomDates ('buildSqliteForRandomDates')
 *
 * This task is for building sqlite3 lib for running the generateRandomDatesForSavedPages. On
 * Windows and Linux, when gulp runs these tasks, it uses node rather than electron to run them, and
 * since sqlite3 is installed for electron and not node, it doesn't work. So we uninstall the electron
 * sqlite3 and install regular node sqlite3 (from our repo so it has the FTS5) and then we can run the gulp
 * task to generate the random dates.
 *
 */
// require('./gulpTasks/buildSqlite3LibBindingsForRandomDates')

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
 * nosourcemaps.js ('nosourcemaps')
 * Remove all the sourcemap files from the frontend js bundles
 * and the frontend css built from the less files.
 * Run browserify for the frontend source, omiting souremap files.
 * Run less for the frontend less files, omiting souremap files.
 * Strip any console calls from the frontend js bundles.
 */
require('./gulpTasks/build/nosourcemaps')

/****
 * build.js ('packageosx', 'packagewin64', 'packagewin32', 'packagelinux64', 'packagelinux32')
 * Build the app for distribution as an executable.
 */
require('./gulpTasks/build/buildPackages')
