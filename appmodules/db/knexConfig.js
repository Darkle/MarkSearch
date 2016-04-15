'use strict'

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      //filename: ':memory:'
      //dont put the filename here, we need to dynamically set it in appSettings.js and pagesdb.js
    },
    //debug: (process.env.NODE_ENV === 'development'),
    /****
     * https://github.com/tgriesser/knex/pull/1043
     */
    useNullAsDefault: false
  },
  production: {
    client: 'sqlite3',
    connection: {
      //filename: ':memory:'
      //dont put the filename here, we need to dynamically set it in appSettings.js and pagesdb.js
    },
    //debug: (process.env.NODE_ENV === 'development'),
    useNullAsDefault: false
  },
  testing: {
    // client: 'pg',
    // connection: process.env.DATABASE_URL
  }
}