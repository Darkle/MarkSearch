'use strict';

var path = require('path')

var _ = require('lodash')
var debug = require('debug')('MarkSearch:search')
var combs = require('combs')

const STOPWORDS = require('../lunrStopwordFilter.json')

function search(req, res, next){
  debug('search running')
  var lcaseSearchTerms = req.params.searchTerms.toLowerCase()
  var searchIsLoose = (req.params.searchingLoose === 'true')
  debug('lcaseSearchTerms : ', lcaseSearchTerms)
  var domainToSearchFor = null
  /****
   *   Filter out single characters.
   *   If searching by domain, store domain in domainToSearchFor
   *   and remove it from the searchTermsArr. Also, even though pouchdb quick search plugin includes
   *   a stopword list filter, I'm gonna filter the stopword list out here first.
   *   Stopword list is based on: http://git.io/T37UJA
   */
  var searchTermsArr = req.params.searchTerms.split(' ').filter(searchTerm =>{
    var useSearchTerm = searchTerm.length > 1
    if(searchTerm.startsWith('site:')){
      domainToSearchFor = searchTerm.slice(5)
      useSearchTerm = false
    }
    else if(STOPWORDS[searchTerm]){
      useSearchTerm = false
    }
    return useSearchTerm
  })
  debug('Are we searching by domain?', !domainToSearchFor?' NO' : ` YES: ${domainToSearchFor}`)
  var stCombinations = []
  if(!searchIsLoose){
    /****
     * If we're not searching loose, then stCombinations will just be:
     * [ [ 'planet', 'jupiter', 'saturn' ] ]
     */
    stCombinations.push(searchTermsArr)
  }
  else{
  /***
   * If searching loose, generate all the possible grouping permutations
   * of the search terms and sort them by length with largest first.
   * So if searching loose, a search terms of "the planet jupiter and saturn"
   * would become:
   * [ [ 'planet', 'jupiter', 'saturn' ],
   * [ 'planet', 'jupiter' ],
   * [ 'planet', 'saturn' ],
   * [ 'jupiter', 'saturn' ],
   * [ 'planet' ],
   * [ 'jupiter' ],
   * [ 'saturn' ] ]
   */
    stCombinations = _.sortBy(combs(searchTermsArr), terms => -terms.length)
  }
  debug('stCombinations ==========+++++++==========')
  debug(stCombinations)
  var db = req.app.get('pagesDB')
  var dbSearchPromiseRequests = []
  /****
   * If searching by domain & there are no search terms,
   * return all the pages with that domain
   */
  if(domainToSearchFor && !stCombinations.length){
    dbSearchPromiseRequests.push(
        db.allDocs({
          include_docs: true
        }).then( documents => {
          /****
           * filter to domain & sort them so most recent first
           * Using lodash filter/sort here as its a bit faster than native filter/sort
           */
          documents.rows = _.filter(documents.rows, document =>
              document.doc.pageDomain === domainToSearchFor
          )
          documents.rows = _.sortBy(documents.rows, document => -document.doc.dateCreated)
          return documents
        })
    )
  }
  /****
   * Else there are search terms
   */
  else{
    dbSearchPromiseRequests = stCombinations.map(queryTerms =>{
      var searchDetails = {
        query: queryTerms,
        fields: {
          'pageTitle': 4,
          'pageDescription': 2,
          'pageText': 1
        },
        include_docs: true,
      }
      /****
       * If searching by domain when have search terms, add a filter to the search.
       */
      if(domainToSearchFor && stCombinations.length){
        /****
         * Do this with native methods when this is fixed: http://bit.ly/1PeGJAV
         * So for the moment, filter it myself
         * So if change it back to native,
         * remember it looks like this: http://bit.ly/1PeH72p (no else statement)
         */
        //searchDetails.filter = (doc) => doc.pageDomain === domainToSearchFor
        return db.search(searchDetails)
            .then(documents => {
              /****
               * filter to domain
               */
              documents.rows = _.filter(documents.rows, document =>
                  document.doc.pageDomain === domainToSearchFor
              )
              return documents
            })
      }
      else{
        return db.search(searchDetails)
      }
    })
  }
  /****
   * If we're not searching loose, then Promise.all just receives a single promise,
   * because there's just a sinlge promise in dbSearchPromiseRequests, because there
   * was only one array of search terms in stCombinations
   *
   * Promise.all returns an array (resultsObjectsArray) of results objects, each
   * results object in the resultsObjectsArray array contains an array of "database
   * query results" - (resultsObjectsArray looks like this: http://bit.ly/1Q6spO9)
   */
  Promise.all(dbSearchPromiseRequests)
      .then( resultsObjectsArray => {
        /****
         * Remove any results objects that have 0 results in them
         */
        resultsObjectsArray = _.filter(resultsObjectsArray, resultsObj =>
            resultsObj.total_rows > 0
        )
        /****
         * if there are no results, return an empty array
         */
        var finalResults = []
        if(resultsObjectsArray.length > 0){
          /****
           * grab all the "rows" in each of the results objects (i.e. map all the row
           * arrays to a new array)
           */
          var multiResultRowsArray = _.map(resultsObjectsArray, "rows")
          /****
           * flatten the array of result arrays
           */
          var flattenedResultsArr = _.flatten(multiResultRowsArray)
          /****
           * Remove any duplicates.
           */
          finalResults = _.uniq(flattenedResultsArr, row => row.doc._id)
        }
        /****
         * return the result to the express response as json
         */
        res.json(
            {
              total_rows: finalResults.length,
              rows: finalResults
            }
        )
      }).catch( err => {
      /****
       * Send a 404 status code if not found in db
       */
        if(err.status === 404){
          debug("no match found for search")
          res.status(404).end()
        }
        else {
          console.error(err)
          res.status(503).end()
        }
      })
}

module.exports = search