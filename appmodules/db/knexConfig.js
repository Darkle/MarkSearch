'use strict';

var envs = require('envs')

module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      //filename: ':memory:'
    },
    debug: (envs('NODE_ENV') === 'development'),
    /****
     * https://github.com/tgriesser/knex/pull/1043
     */
    useNullAsDefault: false
  },
  production: {
    client: 'sqlite3',
    connection: {
      //filename: ':memory:'
    },
    debug: (envs('NODE_ENV') === 'development'),
    useNullAsDefault: false
  },
  testing: {
    client: 'pg',
    connection: process.env.DATABASE_URL
  }
}