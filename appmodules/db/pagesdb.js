'use strict';

var inspector = require('schema-inspector')
var _ = require('lodash')

var knexConfig = require('./knexConfig')[process.env.NODE_ENV]

/****
 * Pages DB Validation Schemas
 */
var upsertRowValidation = {
  type: 'object',
  strict: true,
  properties: {
    pageUrl: {
      type: 'string'
    },
    dateCreated: {
      type: 'integer',
      gt: 0,
      error: 'dateCreated must be a valid integer and larger than 0'
    },
    pageDomain: {
      type: ['string']
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
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  return pagesdb.db.schema.createTableIfNotExists('pages', function (table) {
    table.text('pageUrl').primary().unique().notNullable()
    table.integer('dateCreated').notNullable()
    table.text('pageDomain').notNullable()
    table.text('pageTitle').nullable()
    table.text('pageText').nullable()
    table.text('pageDescription').nullable()
    table.text('archiveLink').nullable()
    table.text('safeBrowsing').nullable()
  })
  .return(
    /****
     * Create the full text search table.
     */
    pagesdb.db.schema.hasTable('fts').then( exists => {
      if (!exists) {
        return  pagesdb.db.raw(
            `create virtual table fts using fts5 (
              pageUrl unindexed,
              dateCreated unindexed,
              pageDomain unindexed,
              pageTitle,
              pageText,
              pageDescription,
              archiveLink unindexed,
              safeBrowsing unindexed,
              content='pages',
              tokenize = porter
            );`
        )
      }
    })
  )
}

pagesdb.updateColumns = (columnsDataObj) => {
  if(_.isObject(columnsDataObj.safeBrowsing)){
    columnsDataObj.safeBrowsing = JSON.stringify(columnsDataObj.safeBrowsing)
  }
  var validatedColumnsDataObj = inspector.validate(updateColumnValidation, columnsDataObj)
  if(!validatedColumnsDataObj.valid){
    var errMessage = `Error, passed in column data did not pass validation.
                      Error(s): ${validatedColumnsDataObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return pagesdb.db('pages')
        .where('pageUrl', pageUrlPrimaryKey)
        .update(columnsDataObj)
  }
}

pagesdb.upsertRow = (pageDataObj) => {
  pageDataObj.pageUrl = _.toLower(pageDataObj.pageUrl)
  pageDataObj.dateCreated = _.toInteger(pageDataObj.dateCreated)
  if(_.isObject(pageDataObj.safeBrowsing)){
    pageDataObj.safeBrowsing = JSON.stringify(pageDataObj.safeBrowsing)
  }
  var validatedPageDataObj = inspector.validate(upsertRowValidation, pageDataObj)
  if(!validatedPageDataObj.valid){
    var errMessage = `Error, passed in page data did not pass validation.
                      Error(s): ${validatedPageDataObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    pagesdb.db('pages')
      .where({
        pageUrl: pageDataObj.pageUrl
      })
      .select('pageUrl')
      .then( rows => {
        /****
         * If row is already there, update it
         */
        if(rows.length){
          return pagesdb.updateColumns(pageDataObj)
        }
        else{
          /****
           * Insert the new row, then need to grab that row to get its rowid
           * for the fts insert
           */
          return pagesdb.insertRow(pageDataObj)
        }
      })
  }
}

pagesdb.insertRow = rowData =>
  pagesdb
    .db('pages')
    .insert(rowData)
    .return(
      pagesdb
        .db
        .select(
          'rowid',
          'pageUrl',
          'dateCreated',
          'pageDomain',
          'pageTitle',
          'pageText',
          'pageDescription',
          'archiveLink',
          'safeBrowsing'
        )
        .from('pages')
        .where('pageUrl', rowData.pageUrl)
        .then(rows =>
          pagesdb
            .db('fts')
            .insert({
              rowid: rows[0].rowid,
              pageUrl: rows[0].pageUrl,
              dateCreated: rows[0].dateCreated,
              pageDomain: rows[0].pageDomain,
              pageTitle: rows[0].pageTitle,
              pageText: rows[0].pageText,
              pageDescription: rows[0].pageDescription,
              archiveLink: rows[0].archiveLink,
              safeBrowsing: rows[0].safeBrowsing
            })
        )
    )

pagesdb.deleteRow = pageUrl =>
  pagesdb
    .db
    .select(
      'rowid',
      'pageUrl',
      'dateCreated',
      'pageDomain',
      'pageTitle',
      'pageText',
      'pageDescription',
      'archiveLink',
      'safeBrowsing'
    )
    .from('pages')
    .where('pageUrl', pageUrl)
    .then(rows =>
       pagesdb
        .db('fts')
        .insert({
          fts: 'delete',
          rowid: rows[0].rowid,
          pageUrl: rows[0].pageUrl,
          dateCreated: rows[0].dateCreated,
          pageDomain: rows[0].pageDomain,
          pageTitle: rows[0].pageTitle,
          pageText: rows[0].pageText,
          pageDescription: rows[0].pageDescription,
          archiveLink: rows[0].archiveLink,
          safeBrowsing: rows[0].safeBrowsing
        })
    )
    .return(
        pagesdb
          .db('pages')
          .where('pageUrl', pageUrl)
          .del()
    )

module.exports = pagesdb