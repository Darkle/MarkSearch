'use strict';

var Promise = require("bluebird")
var debug = require('debug')('MarkSearch:save2db')

function save2db(db, doc2save){
  return new Promise((resolve, reject) => {
    db.get(doc2save._id, (err, doc) => {
      if(err){
        if(err.status === 404){
          /****
           * If the doc was not already in the database, we add it
           * and send back doc & appropriate status code for update
           * http://httpstatus.es/201
           */
          debug('the doc was not already in the database')
          db.put(doc2save, (err, response) => {
            if(err){
              /****
               * Database error
               */
              reject(err)
            }
            /****
             * Seems you can only send one value back (only return one value)
             * http://stackoverflow.com/questions/22773920/
             */
            debug('db.put successful')
            resolve({
              returnedDoc: doc2save,
              httpStatusCode: 201
            })
          })
        }
        else{
          /****
           * Database error
           */
          reject(err)
        }
      }
      else{
        /*****
         * if it was already there, we update it,
         * & send doc back with revision number and
         * appropriate status code for update
         * http://httpstatus.es/204
         *****/
        debug('it was already there, we update it')
        doc2save._rev = doc._rev
        db.put(doc2save, (err, response) => {
          /****
           * response is: { ok: true, id: 'foo', rev: '1-933bfb896eb' }
           */
          if(err){
            /****
             * Database error
             */
            reject(err)
          }
          debug('db.put successful')
          resolve({
            returnedDoc: doc2save,
            httpStatusCode: 204
          })
        })
      }
    })
  })
}

module.exports = save2db