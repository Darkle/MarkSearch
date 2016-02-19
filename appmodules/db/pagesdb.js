'use strict';

var debug = require('debug')('MarkSearch:pagesdb')
var inspector = require('schema-inspector')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

/****
 * Validation Schemas
 */
var upsertRowValidation = {
  type: 'object',
  strict: true,
  properties: {
    pageUrl: {
      type: 'string',
      pattern: 'lowerString'
    },
    dateCreated: {
      type: 'integer',
      gt: 0
    },
    pageTitle: {
      type: ['string', 'null']
    },
    pageText: {
      type: ['string', 'null']
    },
    pageDescription: {
      type: ['string', 'null']
    },
    archiveLink: {
      type: ['string', 'null']
    },
    safeBrowsing: {
      type: ['string', 'null']
    },
  }
}
var updateColumnValidation = {
  type: 'object',
  strict: true,
  someKeys: ['archiveLink', 'safeBrowsing'],
  properties: {
    archiveLink: {
      type: ['string', 'null'],
      optional: true
    },
    safeBrowsing: {
      type: ['string', 'null'],
      optional: true
    },
  }
}

var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  debug(`pagesDBFilePath: ${pagesDBFilePath}`)
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  return pagesdb.db.schema.hasTable('pages').then( exists => {
    if (!exists) {
      debug('creating "pages" table')
      /****
       *  Using 'unique on conflict replace' so can do upserts by
       *  just doing a regular insert. Using the validation schema
       *  to make sure that have all necessary fields when updating.
       */
      return  pagesdb.db.raw('create table "pages" ' +
          '(' +
          '"pageUrl" text not null unique on conflict replace, ' +
          '"dateCreated" integer not null, ' +
          '"pageTitle" text null, ' +
          '"pageText" text null, ' +
          '"pageDescription" text null, ' +
          '"archiveLink" text null, ' +
          '"safeBrowsing" text null, ' +
          'primary key ("pageUrl")' +
          ');')
      //return pagesdb.db.schema.createTable('pages', table => {
      //  table.text('pageUrl').primary().notNullable()
      //  table.integer('dateCreated').notNullable()
      //  table.text('pageTitle').nullable()
      //  table.text('pageText').nullable()
      //  table.text('pageDescription').nullable()
      //  table.text('archiveLink').nullable()
      //  table.text('safeBrowsing').nullable()
      //})
    }
  })
}

pagesdb.updateColumn = (columnDataObj, primaryKey) =>{
  var validatedColumnDataObj = inspector.validate(updateColumnValidation, columnDataObj)
  if(!validatedColumnDataObj.valid){
    var errMessage = `Error, passed in column data did not pass validation.
                      Error(s): ${validatedColumnDataObj.format()}`
    debug(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return pagesdb.db('pages').where('pageUrl', primaryKey).update(columnDataObj)
  }

}

pagesdb.upsertRow = (pageDataObj) => {
  var validatedPageDataObj = inspector.validate(upsertRowValidation, pageDataObj)
  if(!validatedPageDataObj.valid){
    var errMessage = `Error, passed in page data did not pass validation.
                      Error(s): ${validatedPageDataObj.format()}`
    debug(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return pagesdb.db('pages').insert(pageDataObj)
  }
}

module.exports = pagesdb