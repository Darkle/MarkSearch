'use strict';

var path = require('path')
var Crypto = require('crypto')

var Promise = require("bluebird")
var fsExtra = Promise.promisifyAll(require('fs-extra'))
var debug = require('debug')('MarkSearch:initializeDBs')
var NedbStore = require('nedb')
Promise.promisifyAll(NedbStore.prototype)
var PouchDB = require('pouchdb')
PouchDB.plugin(require('pouchdb-quick-search'))

function initializeDBs(app){
  /*****
   * Initialize Databases:
   * appDB stores the Marksearch settings as well as the location of the
   * pages.db database file, so that a user may change the location
   * e.g. to their Drobox folder so its always backed up
   *
   * pagesDB stores the bookmarks
   */
  var appDB = new NedbStore(
      {
        filename: path.join('db', 'app', 'app.db'),
        autoload: true
      }
  )
  return appDB.findOneAsync({_id: 'appSettingsDoc'})
      .then(appSettingsDoc => {
        if(!appSettingsDoc){
          console.log('first run')
          /***
           * On first run, save the location where the pages db will be stored.
           * Also generate a random secret to be used with the Jason Web Tokens for the
           * browser extensions.
           * http://stackoverflow.com/questions/8855687/ - make it url safe just in case
           */
          var doc = {
            _id: 'appSettingsDoc',
            pagesDBFilePath: path.join('db', 'pages', 'pages'),
            JWTsecret: Crypto.randomBytes(128).toString('hex'),
            markSearchSettings: {
              defaultToSearchLoose: true,
              prebrowsing: true
            }
          }
          return appDB.insertAsync(doc)
        }
        else{
          debug('not first run')
          return appSettingsDoc
        }
      })
      .tap(appSettingsDoc =>{
        /****
         * Make sure that the parent directory for the pages db exists, because if it doesn't
         * pouchdb wont create it and will fall back to in-memory (i think).
         * https://github.com/jprichardson/node-fs-extra#ensuredirdir-callback
         * ensureDir() Ensures that the directory exists. If the directory structure does
         * not exist, it is created.
         * https://nodejs.org/api/path.html#path_path_dirname_p
         */
        return fsExtra.ensureDirAsync(path.dirname(appSettingsDoc.pagesDBFilePath))
      })
      .then( appSettingsDoc =>{
        var pagesDB = new PouchDB(appSettingsDoc.pagesDBFilePath)
        /****
         * In development, replicate to couchDB so can use couchDB interface to check database data
         */
        if(app.get('env') === 'development'){
          //PouchDB.replicate(appSettingsDoc.pagesDBFilePath, 'http://localhost:5984/marksearch_pages', {live: true})
          //Using syc so can use couchdb web interface if need to alter database data
          PouchDB.sync(appSettingsDoc.pagesDBFilePath, 'http://localhost:5984/marksearch_pages')
        }
        return [pagesDB, appSettingsDoc]
      })
      .spread( (pagesDB, appSettingsDoc) =>
      /****
       * Build up the index for quick search
       * https://github.com/nolanlawson/pouchdb-quick-search#building-the-index
       */
        [
          pagesDB.search({
            fields: ['pageTitle', 'pageText'],
            build: true
          }),
          pagesDB,
          appSettingsDoc
        ]
      )
      .spread((pouchdbFindIndex, pagesDB, appSettingsDoc) =>{
        /****
         * Return appSettingsDoc, appDB and pagesDB so can use app.set() in app.js
         * to make them available elsewhere.
         */
          return  {
              appDB: appDB,
              pagesDB: pagesDB,
              appSettings: appSettingsDoc
            }
          }
      )

}

module.exports = initializeDBs