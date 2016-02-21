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
  return pagesdb.db.schema.hasTable('pages').then( exists => {
    if (!exists) {
      console.log('creating "pages" table')
      /****
       *  Using 'unique on conflict replace' so can do upserts by
       *  just doing a regular insert. Using the validation schema
       *  to make sure that have all necessary fields when upserting.
       */
      return  pagesdb.db.raw('create table "pages" ' +
          '(' +
          '"pageUrl" text not null unique on conflict replace, ' +
          '"dateCreated" integer not null, ' +
          '"pageDomain" text not null, ' +
          '"pageTitle" text null, ' +
          '"pageText" text null, ' +
          '"pageDescription" text null, ' +
          '"archiveLink" text null, ' +
          '"safeBrowsing" text null, ' +
          'primary key ("pageUrl")' +
          ');')
    }
  })
}

pagesdb.updateColumn = (columnDataObj, pageUrlPrimaryKey) => {
  if(_.isObject(columnDataObj.safeBrowsing)){
    columnDataObj.safeBrowsing = JSON.stringify(columnDataObj.safeBrowsing)
  }
  var validatedColumnDataObj = inspector.validate(updateColumnValidation, columnDataObj)
  if(!validatedColumnDataObj.valid){
    var errMessage = `Error, passed in column data did not pass validation.
                      Error(s): ${validatedColumnDataObj.format()}`
    console.error(errMessage)
    return Promise.reject(errMessage)
  }
  else{
    /****
     * Doing a catch here as the knex statment doesn't seem to be run unless there
     * is a .next or .catch following it. Putting catch here in case I forget to put
     * a catch wherever i use pagesdb.updateColumn or pagesdb.upsertRow. And re-throwing
     * the error so things work as expected down the line.
     */
    return pagesdb.db('pages')
        .where('pageUrl', pageUrlPrimaryKey)
        .update(columnDataObj)
        .catch(err => {
          console.log('an error occured with the update')
          console.error(err)
          throw new Error(err)
        })
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
    return pagesdb.db('pages')
        .insert(pageDataObj)
        .catch(err => {
          console.log('an error occured with the insert')
          console.error(err)
          throw new Error(err)
        })
  }
}

module.exports = pagesdb