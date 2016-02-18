'use strict';

var debug = require('debug')('MarkSearch:pagesdb')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  debug(`pagesDBFilePath: ${pagesDBFilePath}`)
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  pagesdb.db.schema.createTableIfNotExists('pages', table => {
    /****
     * This callback gets called even if the table exits - but it
     * still only creates the table if it doesnt exist:
     * https://github.com/tgriesser/knex/issues/729
     */
    debug('may be creating "pages" table')
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

//pagesdb.update = (keyValObj) =>
//    appSettings.db('appSettings')
//        .where('id', 'appSettings')
//        .update(keyValObj)
//        .return(appSettings.db('appSettings').where('id', 'appSettings'))
//        .then( rows => {
//          appSettings.settings = rows[0]
//        })

module.exports = pagesdb