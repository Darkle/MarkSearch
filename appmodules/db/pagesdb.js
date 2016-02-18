'use strict';

var debug = require('debug')('MarkSearch:pagesdb')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  debug(`pagesDBFilePath: ${pagesDBFilePath}`)
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  return pagesdb.db.schema.hasTable('pages').then( exists => {
    if (!exists) {
      return pagesdb.db.schema.createTable('pages', table => {
        debug('creating "pages" table')
        table.text('pageURL').primary().notNullable()
        table.integer('dateCreated').notNullable()
        table.text('pageTitle').nullable()
        table.text('pageText').nullable()
        table.text('pageDescription').nullable()
        table.text('archiveLink').nullable()
        table.text('safeBrowsing').nullable()
      })
    }
  })
}

//pagesdb.update = (keyValObj) =>
//    pagesdb.db( )
//        .where('id', 'appSettings')
//        .update(keyValObj)
//        .return(appSettings.db('appSettings').where('id', 'appSettings'))
//        .then( rows => {
//          appSettings.settings = rows[0]
//        })

module.exports = pagesdb