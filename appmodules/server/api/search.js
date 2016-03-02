'use strict';

var pagesdb = require('../../db/pagesdb')
var STOPWORDS = require('../lunrStopwordFilter.json')

function search(req, res, next){

/*
  'pageTitle, ' +
  'pageText, ' +
  'pageDescription,' +

  SELECT * FROM email WHERE email MATCH 'fts5';
  SELECT highlight(email, 2, '<b>', '</b>') FROM email('fts5');
  SELECT highlight(email, 2, '<span class="searchHighlight">', '</span>') FROM email WHERE email MATCH 'fts5';
  MATCH '"one two three"'
  MATCH '"one two three"'
  MATCH 'foo OR NEAR(foo bar)'
  SELECT * FROM fts WHERE fts MATCH ? ORDER BY bm25(fts)
  'pageTitle': 4,
      'pageDescription': 2,
      'pageText': 1
  SELECT * FROM email WHERE email MATCH ? ORDER BY bm25(email, 10.0, 5.0);

   Probably want to use the snippet() auxiliary function

  prolly do MATCH foo or NEAR
   for regular search (no domain), could just rely on rowid
   how will the ordering go, make sure to order by bm25
   and then obviously if its a domain search with no query text, sort by dateCreated

   see if i con construct it not using raw
   pagesdb.db.raw

  "SELECT * FROM example_table WHERE _id IN " +
  "(SELECT docid FROM fts_example_table WHERE fts_example_table MATCH ?)"

 SELECT *
 FROM t2
 WHERE id IN (SELECT docid
 FROM fts_table
 WHERE col_text MATCH 'something')

  Whatever i use (raw or whatever), make sure to use the , [1], rather than inserting the query text directly
  so no sql injection

 Remember can use ones wrapped raw queries so if need to use raw, it doesn't have to be all raw
Remember to send back an error 500 or whatever on sql error
  */

  console.log('search running')
  var lcaseSearchTerms = req.params.searchTerms.toLowerCase()
  var domainToSearchFor = null
  /****
   * Filter out single characters.
   * If searching by domain, store domain in domainToSearchFor
   * and remove it from the searchTermsArr.
   * Also remove word if it's in the stopword list.
   * Stopword list is based on: http://git.io/T37UJA
   */
  var searchTerms = lcaseSearchTerms.split(' ').filter( searchTerm => {
    var useSearchTerm = searchTerm.length > 1
    if(searchTerm.startsWith('site:')){
      domainToSearchFor = searchTerm.slice(5)
      useSearchTerm = false
    }
    else if(STOPWORDS[searchTerm]){
      useSearchTerm = false
    }
    return useSearchTerm
  }).join(' ')

  console.log(`searchTerms`)
  console.log(searchTerms)

  console.log('Are we searching by domain?', !domainToSearchFor ? ' NO' : ` YES: ${domainToSearchFor}`)

  if(!searchTerms.length){
    if(domainToSearchFor){
      pagesdb.db('pages')
        .where({
          pageDomain: domainToSearchFor
        })
        .orderBy('dateCreated', 'desc')
        .then( rows => {
          console.log(rows)
          res.json(rows)
        } )
        .catch(err => {
          console.error(err)
          res.status(500).end()
        })
    }
    else{
      res.json([])
    }
  }
  else{
    var fullTextSearch = pagesdb.db.select('rowid')
        .from('fts')
        .whereRaw(
            'fts match ? order by rank',
            `"${searchTerms}" or NEAR(${searchTerms})`
        )
    if(domainToSearchFor){
      pagesdb.db('pages')
        .where({
          pageDomain: domainToSearchFor
        })
        .whereIn('rowid', fullTextSearch)
        .then( rows => res.json(rows) )
        .catch(err => {
          console.error(err)
          res.status(500).end()
        })
    }
    else{
      console.log(pagesdb.db('pages').whereIn('rowid', fullTextSearch).toString());
      pagesdb.db('pages').whereIn('rowid', fullTextSearch)
          .then( rows => res.json(rows) )
        .catch(err => {
          console.error(err)
          res.status(500).end()
        })
    }
  }


  //console.log(fullTextSearch)
  //
  //
  //
  //console.log()
  //
  //.catch( err => {
  //  console.error(err)
  //  res.status(500).end()
  //})

  //pagesdb.db.raw(finalSQLstring)
  //    .then(rows => {
  //      console.log('rows')
  //      console.log(rows)
  //    })
  //    .catch(err => {
  //      console.error(err)
  //    })


  //var knexRawString = pagesdb.db.raw(
  //                      "select * from pages where rowid in ("+
  //                        "select rowid from fts where fts match ? or NEAR(?) order by rank" +
  //                      ")",
  //                      [searchTerms, searchTerms]
  //                    )
  //
  //
  ////console.log(knexRawString)
  //var startOfKnexRawSQLString = knexRawString.slice(0, 74)
  ////console.log(startOfKnexRawSQLString)
  //var middleOfKnexRawSQLString = knexRawString.slice(74, knexRawString.length - 15)
  ////console.log(middleOfKnexRawSQLString)
  //var endOfKnexRawSQLString = knexRawString.slice(-15, knexRawString.length)
  ////console.log(endOfKnexRawSQLString)
  //var finalSQLstring = `${startOfKnexRawSQLString}'${middleOfKnexRawSQLString}'${endOfKnexRawSQLString}`
  ////console.log(finalSQLstring)





}























function searcasdh(req, res, next){


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
  console.log('stCombinations ==========+++++++==========')
  console.log(stCombinations)
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
          console.log("no match found for search")
          res.status(404).end()
        }
        else {
          console.error(err)
          res.status(500).end()
        }
      })
}

module.exports = search