'use strict';

var path = require('path')

var debug = require('debug')('MarkSearch:pagesdb')
var envs = require('envs')

var knexConfig = require('./knexConfig')[envs('NODE_ENV')]

var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  debug(`pagesDBFilePath: ${pagesDBFilePath}`)
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  pagesdb.db.schema.createTableIfNotExists('pages', function(table) {
    debug('createTableIfNotExists')
    table.text('pageURL').primary().notNullable()
    table.integer('dateCreated').notNullable()
    table.text('pageTitle').nullable()
    table.text('pageText').nullable()
    table.text('pageDescription').nullable()
    table.text('archiveLink').nullable()
    table.text('safeBrowsing').nullable()
  }).return(
    /****
     * When a user goes to the MarkSearch home page, they are presented with all
     * their bookmarks in descending chronological order from most recent
     * to least recent. Since this is a query that will be called often, it might
     * be good to create an index for that desc query.
     * Doing index sql as raw cause of:
     * https://github.com/tgriesser/knex/issues/729
     * https://github.com/tgriesser/knex/issues/322
     */
      pagesdb.db.raw('create index if not exists "pagesSortedDesc" on pages (dateCreated desc)')
  )
}

module.exports = pagesdb