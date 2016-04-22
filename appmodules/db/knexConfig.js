'use strict'

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      //dont put the filename here, we need to dynamically set it in appSettings.js and pagesdb.js
    },
    /****
     * https://github.com/tgriesser/knex/pull/1043
     */
    useNullAsDefault: false
  },
  production: {
    client: 'sqlite3',
    connection: {
    },
    useNullAsDefault: false
  }
}