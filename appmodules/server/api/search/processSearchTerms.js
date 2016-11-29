'use strict'

var _ = require('lodash')

var STOPWORDS = require('./lunrStopwordFilter.json')

function processSearchTerms(searchTerms) {

  global.devMode && console.log(`searchTerms before process`)
  global.devMode && console.log(searchTerms)

  /****
   * Filter out search terms less than 1 character.
   *
   * If searching by domain, store domain in domainToSearchFor
   * and remove it from the the array of search terms.
   *
   * Also remove word if it's in the stopword list.
   * Stopword list is based on: http://git.io/T37UJA
   *
   * If there is a hyphen in any of the search words, then surround
   * it in double quotes.
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

  var lowercaseSearchTerms = searchTerms.toLowerCase()
  var domainToSearchFor = null

  var processedSearchTerms = lowercaseSearchTerms
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
    .map(searchTerm => {
      var hyphenIndex = searchTerm.indexOf('-')
      var pipeIndex = searchTerm.indexOf('|')
      if(hyphenIndex > -1){
        if(hyphenIndex === 0){
          searchTerm = `NOT ${ searchTerm.slice(1) }`
        }
        else{
          /****
           * If the hyphenated word itself is already enclosed in quotes, then we
           * should leave it and not add extra quotes.
           * e.g. if the search term is "foo-bar"
           *
           * Also, if the hyphenated word itself is already enclosed in quotes and preceded by
           * a pipe, then we should leave it and not add extra quotes.
           * e.g. if the search term is |"foo-bar"
           *
           * Also, if the search term is in double quotes of a bigger phrase, then
           * we should leave it and not add extra quotes.
           * e.g. if the user searched for "hello whatevs foo-bar"
           *
           * match regex from: http://stackoverflow.com/a/147667/3458681
           */
          var searchTermItselfIsEnclosedInQuotes = /^\|?".+"$/.test(searchTerm)
          if(!searchTermItselfIsEnclosedInQuotes){
            var searchTermIsInsideLargerQuotedPhrase = false
            var matchQuotes = lowercaseSearchTerms.match(/[^"]+(?=(" ")|"$)/g)
            if(_.get(matchQuotes, 'length')){
              /****
               * If the search term is at trailing end of a quoted phrase then
               * it will have a trailing double quote as its last character, so
               * get rid of it for when checking if the word is in the quoted phrase
               * we captured with match.
               */
              var searchTermSansTrailingQuote = searchTerm.split('"')[0]
              searchTermIsInsideLargerQuotedPhrase = matchQuotes.some(val => val.indexOf(searchTermSansTrailingQuote) > -1)
            }
            if(!searchTermIsInsideLargerQuotedPhrase){
              /****
               * If it's not quoted and has a pipe preceding it, then remove pipe,
               * add quotes and add pipe back for the pipe check and add OR below.
               */
              if(pipeIndex === 0){
                searchTerm = `|"${ searchTerm.slice(1) }"`
              }
              else{
                searchTerm = `"${ searchTerm }"`
              }
            }
          }
        }
      }
      /****
       * Use 'if{}' instead of 'else if{}' as there may be a word
       * that has a hyphen in it that they also preface with
       * pipe - another if here will let it be quoted in previous if statment
       * and so we can then add an OR to it here.
       */
      if(pipeIndex === 0){
        searchTerm = `OR ${ searchTerm.slice(pipeIndex + 1) }`
      }
      return searchTerm
    })
    .join(' ')

  global.devMode && console.log(`searchTerms after process`)
  global.devMode && console.log(processedSearchTerms)
  global.devMode && console.log('Are we searching by domain?', !domainToSearchFor ? ' NO' : ` YES: ${ domainToSearchFor }`)

  return {
    processedSearchTerms,
    domainToSearchFor
  }
}

module.exports = processSearchTerms
