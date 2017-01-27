'use strict'

var STOPWORDS = require('./lunrStopwordFilter.json')

function processSearchTerms(searchTerms) {

  global.devMode && console.log(`searchTerms before process`)
  global.devMode && console.log(searchTerms)

  /****
   * Filter out search terms with less than 1 character.
   *
   * If searching by domain, store domain in domainToSearchFor
   * and remove it from the the array of search terms.
   *
   * Also remove word if it's in the stopword list.
   * Stopword list is based on: http://git.io/T37UJA
   *
   * Remove any quotes from the string.
   *
   * Encapsulate the search terms as a whole inside double-quotes.
   *
   * Encapsulate each search term individually inside double-quotes.
   *
   * (We wrap the search terms as a whole and also individual words with double quotes in case they have
   * some odd characters like '>' or '.' that would cause a syntax error in the query).
   *
   * If there is a hyphen at the start of the word, consider
   * it an operator and add NOT to the start of the word.
   * http://stackoverflow.com/a/21599291/3458681
   *
   * If there is a pipe at the start of the word, consider
   * it an operator and add OR to the start of the word.
   *
   * note: SQLite fts MATCH considers a space between words to
   * be an AND operator: https://sqlite.org/fts5.html#section_3
   */

  var searchTermsQuotesRemoved = searchTerms.replace(/"/g, ``).replace(/'/g, ``)
  var lowercaseSearchTerms = searchTermsQuotesRemoved.toLowerCase()
  var domainToSearchFor = null
  var searchOperatorUsed = false

  var filteredSearchTerms = lowercaseSearchTerms
    .split(' ')
    .filter( searchTerm => {
      var useSearchTerm = searchTerm.length > 1
      if(searchTerm.startsWith('site:')){
        /*****
        * The prepended dot here is so we can search for the domain as 'ends with .foo.bar'. More info
        * in the addPage.js re: domain search (above 'var pageDomain').
        */
        domainToSearchFor = '.' +searchTerm.slice(5)
        useSearchTerm = false
      }
      else if(STOPWORDS[searchTerm]){
        useSearchTerm = false
      }
      return useSearchTerm
    })

  var searchTermsQuotedAsAwhole = `"${ filteredSearchTerms.join(' ') }"`
  var numberOfSearchTerms = filteredSearchTerms.length

  var individualSearchWordsQuoted = filteredSearchTerms
    .map((searchTerm, index) => {
      if(searchTerm.startsWith('-')){
        searchOperatorUsed = true
        searchTerm = `NOT "${ searchTerm.slice(1) }"`
      }
      else if(searchTerm.startsWith('|')){
        searchOperatorUsed = true
        searchTerm = `OR "${ searchTerm.slice(1) }"`
      }
      /*****
      * AND is so for multiple words, our query ends up being `from "fts" where fts match '"tech news" OR ("tech" AND "news")'`
      */
      else{
        searchTerm = index === 0 ? `"${ searchTerm }"` : `AND "${ searchTerm }"`
      }
      return searchTerm
    })
    .join(' ')

  global.devMode && console.log(`searchTerms after process`)
  global.devMode && console.log(individualSearchWordsQuoted)
  global.devMode && console.log('Are we searching by domain?', !domainToSearchFor ? ' NO' : ` YES: ${ domainToSearchFor }`)

  return {
    individualSearchWordsQuoted,
    domainToSearchFor,
    searchTermsQuotedAsAwhole,
    numberOfSearchTerms,
    searchOperatorUsed
  }
}

module.exports = processSearchTerms
