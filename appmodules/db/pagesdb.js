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
    }
  }
}
/****
 * The updateColumnValidation is slightly different as it doesn't
 * always have data for every column.
 */
var updateColumnValidation = {
  type: 'object',
  strict: true,
  someKeys: [
    'dateCreated',
    'pageDomain',
    'pageTitle',
    'pageText',
    'pageDescription',
    'archiveLink',
    'safeBrowsing',
    'checkedForExpiry'
  ],
  properties: {
    dateCreated: {
      type: 'integer',
      optional: true,
      gt: 0,
      error: 'dateCreated must be a valid integer and larger than 0'
    },
    pageDomain: {
      type: ['string'],
      optional: true
    },
    pageTitle: {
      type: ['string', 'null'],
      optional: true
    },
    pageText: {
      type: ['string', 'null'],
      optional: true
    },
    pageDescription: {
      type: ['string', 'null'],
      optional: true
    },
    archiveLink: {
      type: ['string', 'null'],
      optional: true
    },
    safeBrowsing: {
      type: ['string', 'null'],
      optional: true
    },
    checkedForExpiry: {
      type: 'boolean',
      optional: true
    },
  }
}

function coerceIncomingColumnData(dataObj){
  if(dataObj.pageUrl){
    dataObj.pageUrl = _.toLower(dataObj.pageUrl)
  }
  if(dataObj.dateCreated){
    dataObj.dateCreated = _.toInteger(dataObj.dateCreated)
  }
  /****
   * _.isObject(dataObj.safeBrowsing) will also return false if
   * dataObj.safeBrowsing does not exist
   */
  if(_.isObject(dataObj.safeBrowsing)){
    dataObj.safeBrowsing = JSON.stringify(dataObj.safeBrowsing)
  }
  return dataObj
}

var pagesdb = {}

pagesdb.init = (pagesDBFilePath) => {
  knexConfig.connection.filename = pagesDBFilePath
  //knexConfig.connection.filename = ':memory:'
  pagesdb.db = require('knex')(knexConfig)
  return pagesdb.db.schema.hasTable('pages').then( exists => {
      if (!exists) {
        console.log('creating "pages" table')
        return  pagesdb.db.raw(
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
      if (!exists) {
        console.log('creating "fts" table')
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
  var coercedColumnsDataObj = coerceIncomingColumnData(columnsDataObj)
  var pageUrlPrimaryKey = coercedColumnsDataObj.pageUrl
  var coercedColumnsDataObjNoPageUrl = _.omit(coercedColumnsDataObj, ['pageUrl'])
  var validatedColumnsDataObj = inspector.validate(updateColumnValidation, coercedColumnsDataObjNoPageUrl)

  if(!validatedColumnsDataObj.valid){
    var errMessage = `Error, passed in column data did not pass validation.
                      Error(s): ${validatedColumnsDataObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return pagesdb
            .db('pages')
            .where('pageUrl', pageUrlPrimaryKey)
            .update(coercedColumnsDataObjNoPageUrl)
            .then(() =>
              pagesdb
                .db('fts')
                .where('pageUrl', pageUrlPrimaryKey)
                .update(coercedColumnsDataObjNoPageUrl)
            )
  }
}

pagesdb.upsertRow = (rowDataObj) => {
  var coercedPageDataObj = coerceIncomingColumnData(rowDataObj)
  var validatedPageDataObj = inspector.validate(upsertRowValidation, coercedPageDataObj)

  if(!validatedPageDataObj.valid){
    var errMessage = `Error, passed in row data did not pass validation.
                      Error(s): ${validatedPageDataObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    return pagesdb
            .db('pages')
            .where({
              pageUrl: coercedPageDataObj.pageUrl
            })
            .select('pageUrl')
            .then( rows => {
              /****
               * If row is already there, update it
               */
              if(rows.length){
                return pagesdb.updateColumns(coercedPageDataObj)
              }
              else{
                return pagesdb.insertRow(coercedPageDataObj)
              }
            })
  }
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
    .then(numRowsUpdated =>
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
    )


pagesdb.deleteRow = pageUrl => {
  if(!_.isString(pageUrl)){
    return Promise.reject(`pageUrl passed to pagesdb.deleteRow was not a string`)
  }
  else{
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

}

module.exports = pagesdb