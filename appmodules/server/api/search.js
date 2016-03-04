'use strict';

var pagesdb = require('../../db/pagesdb')
var STOPWORDS = require('../lunrStopwordFilter.json')
var checkAndCoerceDateFilterParams = require('../../utils/checkAndCoerceDateFilterParams')

function search(req, res, next){

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

  var dateFilter = checkAndCoerceDateFilterParams(req.body)

  if(!searchTerms.length){
    /****
     * If user just wants to list all saved pages by a domain with no text search
     */
    if(domainToSearchFor){
      var domainSearchPagesdbSelect = pagesdb.db('pages').where({pageDomain: domainToSearchFor})

      if(dateFilter){
        /****
         * knex will automatically convert additional WHERE's to AND WHERE
         */
        domainSearchPagesdbSelect = domainSearchPagesdbSelect
                                      .where('dateCreated', '>=', dateFilter.dateFilterStartDate)
                                      .where('dateCreated', '<=', dateFilter.dateFilterEndDate)
      }

      domainSearchPagesdbSelect
        .orderBy('dateCreated', 'desc')
        .then( rows => res.json(rows))
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
    var selectFromFTS = pagesdb.db.select(
          `rank`,
          `pageUrl`,
          `dateCreated`,
          `pageDomain`,
          `pageTitle`,
          `pageText`,
          `pageDescription`,
          `archiveLink`,
          `safeBrowsing`,
          pagesdb.db.raw(`snippet(fts, -1, '<span class="searchHighlight">', '</span>', '...', 64) as snippet`)
        )
        .from('fts')

    if(domainToSearchFor){
      selectFromFTS = selectFromFTS.where({pageDomain: domainToSearchFor})
    }
    if(dateFilter){
      selectFromFTS = selectFromFTS
                        .where('dateCreated', '>=', dateFilter.dateFilterStartDate)
                        .where('dateCreated', '<=', dateFilter.dateFilterEndDate)
    }
    /****
     * https://sqlite.org/fts5.html#section_5_1_1
     * bm25(fts, 4.0, 1.0, 2.0) - Give pageTitle a boost of 4,
     * and pageDescription a boost of 2.
     * Note: the SQL operators in the 'searchTerm OR NEAR()` are case-sensitive
     * and must be in uppercase!
     */
    selectFromFTS
      .whereRaw(`fts match ? order by bm25(fts, 4.0, 1.0, 2.0)`, `"${searchTerms}" OR NEAR(${searchTerms})`)
      .then( rows => {
        res.json(rows)
      })
      .catch( err => {
        console.error(err)
        res.status(500).end()
      })

  }

}

module.exports = search