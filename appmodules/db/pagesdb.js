'use strict'

var inspector = require('schema-inspector')
var _ = require('lodash')
/****
 * Note: we need blubird promises (info in comments below).
 */
var Promise = require('bluebird')

var appLogger = require('../utils/appLogger')
var knexConfig = require('./knexConfig')[process.env.NODE_ENV]
var schemas = require('./pagesdbSanitizationAndValidationSchemas')


var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  knexConfig.connection.filename = pagesDBFilePath
  pagesdb.db = require('knex')(knexConfig)
  return pagesdb.db.schema.hasTable('pages').then( exists => {
      if (!exists){
        console.log('creating "pages" table')
        return pagesdb.db.raw(
          `create table pages (
            pageUrl text not null unique on conflict replace,
            dateCreated integer not null,
            pageDomain text not null,
            pageTitle text null,
            pageText text null,
            pageDescription text null,
            archiveLink text null,
            safeBrowsing text null,
            checkedForExpiry boolean null,
            primary key (pageUrl)
          );`
        )
      }
    })
  .then(() =>
    /****
     * Create the full text search table.
     *
     * I'm adding everything to the fts table as it will make it slightly faster
     * when searching as wont need to query & join with the pages table.
     * pageUrl, dateCreated, pageDomain, archiveLink & safeBrowsing
     * are all tiny anyway and shouldn't create any size issues duplicating those.
     *
     * Not using triggers any more as I was having issues with REPLACE. Somehow
     * the DELETE and INSERT for the REPLACE on the pages table was corrupting the
     * fts table.
     */
    pagesdb.db.schema.hasTable('fts').then( exists => {
      if (!exists){
        console.log('creating "fts" table')
        return pagesdb.db.raw(
            `create virtual table fts using fts5 (
              pageUrl unindexed,
              dateCreated unindexed,
              pageDomain unindexed,
              pageTitle,
              pageText,
              pageDescription,
              archiveLink unindexed,
              safeBrowsing unindexed,
              checkedForExpiry unindexed,
              content='pages',
              tokenize = porter
            );`
        )
      }
    })
  )
}

pagesdb.updateColumns = (columnsDataObj) => {

  inspector.sanitize(schemas.updateColumnSanitization, columnsDataObj)

  var validatedColumnsDataObj = inspector.validate(schemas.updateColumnValidation, columnsDataObj)
  if(!validatedColumnsDataObj.valid){
    var errMessage = `Error, passed in column data did not pass validation.
                      Error(s): ${ validatedColumnsDataObj.format() }`
    console.error(errMessage)
    appLogger.log.error({err: errMessage})
    let errorToReturn = new Error(errMessage)
    /****
     * Note: we need to return a blubird promise here, because we use bluebird's
     * bind method in addPage.js and returning a native promise would cause an
     * uncaughtException error as native promise bind is a bit different.
     * Also, throwing an error here would also cause an uncaughtException error
     * because we wouldn't be returning a bluebird promise.
     */
    return Promise.reject(errorToReturn)
  }

  var pageUrlPrimaryKey = columnsDataObj.pageUrl
  var columnsDataObjNoPageUrl = _.omit(columnsDataObj, ['pageUrl'])

  return pagesdb
    .db('pages')
    .where('pageUrl', pageUrlPrimaryKey)
    .update(columnsDataObjNoPageUrl)
    .then(() =>
      pagesdb
        .db('fts')
        .where('pageUrl', pageUrlPrimaryKey)
        .update(columnsDataObjNoPageUrl)
    )
}

pagesdb.upsertRow = (rowDataObj) => {

  inspector.sanitize(schemas.upsertRowSanitization, rowDataObj)

  var validatedPageDataObj = inspector.validate(schemas.upsertRowValidation, rowDataObj)
  if(!validatedPageDataObj.valid){
    var errMessage = `Error, passed in row data did not pass validation.
                      Error(s): ${ validatedPageDataObj.format() }`
    console.error(errMessage)
    appLogger.log.error({err: errMessage})
    let errorToReturn = new Error(errMessage)
    /****
     * Note: we need to return a blubird promise here, because we use bluebird's
     * bind method in addPage.js and returning a native promise would cause an
     * uncaughtException error as native promise bind is a bit different.
     * Also, throwing an error here would also cause an uncaughtException error
     * because we wouldn't be returning a bluebird promise.
     */
    return Promise.reject(errorToReturn)
  }
  return pagesdb
    .db('pages')
    .where('pageUrl', rowDataObj.pageUrl)
    .first()
    .then(row => {
      if(row){
        return pagesdb.updateColumns(rowDataObj)
      }
      return pagesdb.insertRow(rowDataObj)
    })
}

pagesdb.insertRow = rowData =>
  /****
   * We query the pages table again in the middle as the
   * rowid is needed for the fts insert and below for the
   * 'delete' insert - the rowid's need to match up with their
   * pages table rowid counterpart.
   * note: we never call insertRow directly, only via upsertRow,
   * so leave the validation to upsertRow.
   */
   pagesdb
    .db('pages')
    .insert(rowData)
    .then(() =>
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
          'safeBrowsing',
          'checkedForExpiry'
        )
        .from('pages')
        .where('pageUrl', rowData.pageUrl)
    )
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
          safeBrowsing: rows[0].safeBrowsing,
          checkedForExpiry: rows[0].checkedForExpiry
        })

    )


pagesdb.deleteRow = pageUrl => {
  if(!_.isString(pageUrl)){
    let errorToReturn = new Error(`pageUrl passed to pagesdb.deleteRow was not a string`)
    return Promise.reject(errorToReturn)
  }
  /****
   * note: gotta do the fts delete first as it relies on the rowid from the pages table.
   */
  return pagesdb
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
      'safeBrowsing',
      'checkedForExpiry'
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
          safeBrowsing: rows[0].safeBrowsing,
          checkedForExpiry: rows[0].checkedForExpiry
        })
    )
    .then(() =>
      pagesdb
        .db('pages')
        .where('pageUrl', pageUrl)
        .del()
    )

}

module.exports = pagesdb