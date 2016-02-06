'use strict';

var envs = require('envs')
var lunr = require('lunr')
var debug = require('debug')('MarkSearch:buildIndex')

/****
 * (Re)build the quick-search index
 */

function buildIndex(db, consoleInfo){
    debug(`${consoleInfo} started (re)building index`)
    if(envs('NODE_ENV') === 'development'){
      console.time(`${consoleInfo} index build time`)
    }
    return db.search(
        {
          fields: ['pageTitle', 'pageDescription', 'pageText'],
          build: true,
          lunrOptions: function(){
            this.pipeline.remove(lunr.trimmer)
            this.pipeline.remove(lunr.stemmer)
          }
          //https://github.com/olivernn/lunr.js/issues/50 - alternate ways
        }
    ).then(() =>{
      debug(`${consoleInfo} finished (re)building index`)
      if(envs('NODE_ENV') === 'development'){
        console.timeEnd(`${consoleInfo} index build time`)
      }
    })
}

module.exports = buildIndex