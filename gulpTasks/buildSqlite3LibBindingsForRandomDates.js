'use strict'

var gulp = require('gulp')
var exeq = require('exeq')

var platform = process.platform
var useExternalSQLite = false

gulp.task('buildSqliteForRandomDates', () => {
  // TODO - change this back to regular install from default npm when mapbox add fts5 flags & update sqlite source verion
  /****
   *
   * note: the default sqlite3 npm library comes with sqlite-autoconf-3090100.tar.gz, which is a litle old - & while
   * it does include the fts5 addon, it is not enabled in the sqlite source build flags. Only fts3 is enabled.
   *
   * Our fork uses SQLite version 3.12.2 - sqlite-autoconf-3120200.tar.gz, and includes the SQLITE_ENABLE_FTS5 addon flag
   * in sqlite3.gyp.
   *
   * Note: the dist-url may have changed: https://github.com/electron/electron/releases/tag/v1.4.6 & https://github.com/electron/electron/pull/7881
   */
  var shellTask = "npm install sqlite3@https://github.com/Darkle/node-sqlite3" +
                  " --target_arch=" + process.arch +
                  " --target_platform=" + platform +
                  " --build-from-source"

  /****
   * If want to build against an external SQLite (e.g. one installed by homebrew).
   */
  if(useExternalSQLite){
    var externalSQLite = ''
    var externalSQLiteDir
    if(platform === 'darwin'){
      /****
       * Homebrew sqlite installed folder
       * /usr/local/opt/sqlite/ is a symlink to the most up to date version installed in /usr/local/Cellar/sqlite
       * note: with Homebrew, make sure you have installed sqlite using the right
       * flag: e.g. `brew install sqlite3 --with-fts5`
       */
      externalSQLiteDir = '/usr/local/opt/sqlite/'
    }
    // else if(platform === 'linux'){
    //
    // }
    // else if(platform === 'win32'){
    //
    // }
    externalSQLite = `--sqlite=${ externalSQLiteDir }`
    shellTask += ` ${ externalSQLite }`
  }

  console.log(`running ${ shellTask }`)

  return exeq(shellTask)
    .then(function() {
      console.log('Successfully compiled sqlite3 lib binding')
    })
    .catch(function(err) {
      console.error('There was an error building sqlite3 lib binding', err)
    })

})
