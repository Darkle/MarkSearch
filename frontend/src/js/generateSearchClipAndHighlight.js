'use strict';

import combs from 'combs'
import _ from 'lodash'

import { lunrStopwordList } from './lunrStopwordFilter'

/****
 * Generate search result text clip with the search term words in them and
 * then add highlighting. We're giving prefernce to search matches that
 * have higher number of search terms in them.
 * Doing this client side rather than serverside so no performance hit.
 * If we start doing this server side with document fields of 5000+ characters
 * for each document in the database it'll make searching pretty slow.
 * It shouldn't affect client side because we are chunking the results to groups
 * of 200.
 */
function generateSearchClipAndHighlight(row, searchTerms){
  /****
   * searchTerms text is trimmed on searchPage.js
   */
  //check if enough before found words to slice, if not, add more to end so the end result text is
  //as long as the other results text

  var foundTerms = {
    pageDescription: {
      highestNumTermsMatched: 0,
      highlightedText: null
    },
    pageText: {
      highestNumTermsMatched: 0,
      highlightedText: null
    }
  }

  var searchTermsArr = searchTerms.split('%20').filter(searchTerm =>{
    var useSearchTerm = searchTerm.length > 1
    if(lunrStopwordList[searchTerm]){
      useSearchTerm = false
    }
    return useSearchTerm
  })

  var stCombinations = _.sortBy(combs(searchTermsArr), terms => -terms.length)
  console.log(JSON.stringify(stCombinations))

  _.each(stCombinations, arrOfSearchTermCombination => {

    var combinationRegex = new RegExp('(' + arrOfSearchTermCombination.join(' ') + '[a-z]*)', 'gi')
    var replacement = '<span class="searchHighlight">$1</span>'
debugger
    var regexIndexPageDesc = row.pageDescription.search(combinationRegex)
    //debugger
    if(regexIndexPageDesc > -1 && (arrOfSearchTermCombination.length > foundTerms.pageDescription.highestNumTermsMatched) ){
      foundTerms.pageDescription.highestNumTermsMatched = arrOfSearchTermCombination.length
      /***
       * The pageDescription is usually a little less than a paragraph, so just include all of it
       */
      var pdHighlightedText = row.pageDescription
      //debugger
      /****
       * for the replace, do it for each term in case there is a term pre/post match in the slice
       */
      _.each(searchTermsArr, term => {
        var searchTermRegexPd = new RegExp('(' + term + ')', 'gi')
        pdHighlightedText = pdHighlightedText.replace(searchTermRegexPd, replacement)
      })
      foundTerms.pageDescription.highlightedText = pdHighlightedText
      //debugger
    }
    //debugger
    var regexIndexPageText = row.pageText.search(combinationRegex)
    //debugger
    if(regexIndexPageText > -1 && (arrOfSearchTermCombination.length > foundTerms.pageText.highestNumTermsMatched)){
      foundTerms.pageText.highestNumTermsMatched = arrOfSearchTermCombination.length
      /***
       * Grab some text before the match and after the match and account for if near
       * start/end of the text
       */
      var ptSliceStart = regexIndexPageText - 150
      var ptSliceEnd = regexIndexPageText + 150
      var ptHighlightedText
      if(regexIndexPageText < 150){
        ptSliceStart = regexIndexPageText
        ptSliceEnd = ptSliceEnd + (150 - regexIndexPageText)
      }
      if( (row.pageText.length - regexIndexPageText) < 150){
        ptSliceStart = ptSliceStart - (row.pageText.length - regexIndexPageText)
      }
      ptHighlightedText = row.pageText.slice(ptSliceStart, ptSliceEnd)
      /****
       * Re-slice & try to start on a word and end on a word with the slice.
       * Gonna cheat a little and remove the first & last word if its not a search term.
       * (should probably replace this with regex at some point.)
       */
      var secondSliceStart = 0
      var secondSliceEnd = ptHighlightedText.length
      var startsWithSearchTerm = _.any(searchTermsArr, sTerm => ptHighlightedText.startsWith(sTerm) )
      var endsWithSearchTerm = _.any(searchTermsArr, sTerm => ptHighlightedText.endsWith(sTerm) )
      var lastCharacter = ptHighlightedText.charAt(ptHighlightedText.length - 1)
      if(!startsWithSearchTerm){
        secondSliceStart = ptHighlightedText.indexOf(' ') + 1
      }
      if(!endsWithSearchTerm && lastCharacter !== ' ' && lastCharacter !== '.'){
        secondSliceEnd = ptHighlightedText.lastIndexOf(' ')
      }
      ptHighlightedText = ptHighlightedText.slice(secondSliceStart, secondSliceEnd)
      _.each(searchTermsArr, term => {
        var searchTermRegexPt = new RegExp('(' + term + ')', 'gi')
        ptHighlightedText = ptHighlightedText.replace(searchTermRegexPt, replacement)
      })
      foundTerms.pageText.highlightedText = ptHighlightedText
    }
    //debugger
  })

  var returnedHighlight = null
  if(foundTerms.pageText.highestNumTermsMatched > 0){
    returnedHighlight = foundTerms.pageText.highlightedText
  }
  /****
   * Favour returning the page description
   */
  if(foundTerms.pageDescription.highestNumTermsMatched > 0){
    returnedHighlight = foundTerms.pageDescription.highlightedText
  }
  //debugger
  return returnedHighlight

  //row.pageDescription

  /****
   * %20 cause the text is encoded with encodeURIComponent
   */
  //var arrayOfSearchTerms = searchTerms.split('%20')
  //
  ////debugger
  //    //for the moment assume we have more than one search term
  //var regexStringBehind = ''
  //var regexStringTermsForward = ''
  //
  //for(var i = 0; i < arrayOfSearchTerms.length; i++) {
  //  regexStringBehind += `!\\b\\w*${arrayOfSearchTerms[i]}\\w*\\b.{30}|`
  //  regexStringTermsForward += `\\b\\w*${arrayOfSearchTerms[i]}\\w*\\b.{1,60}`
  //  if(i === arrayOfSearchTerms.length - 1){
  //    regexStringBehind += '(.{60})?'
  //    regexStringTermsForward += '.{60}'
  //  }
  //}
  //
  //
  //var regex = new RegExp(regexStringBehind + regexStringTermsForward, 'gi')
  //console.log(regexStringBehind + regexStringTermsForward)
  //var result = regex.exec(row.pageText)
  //console.log(result)
  //debugger
}
/****
 * Exports
 */
export { generateSearchClipAndHighlight }
//ignore when its one for the moment, for the moment, just code as if there are 4+ search terms
/*
doc looks like this coming in:
 _id: "http://www.stuff.tv/reviews"
 _rev: "2-c046155fdfa09d28aea396ac6dcca8f6"
 archiveLink: null
 dateCreated: 1449282471911
 pageDescription: "The latest smartphone, smartwatch, game, app, TV and gadget reviews from Stuff. Read on for the smartest, wittiest, most in-depth product tests on the web"
 pageDomain: "stuff.tv"
 pageText: "Cookies on Stuff.tv↵We use cookies to improve your experience. By using our site you are accepting our Cookie Policy.↵Continue↵STUFF UK↵SUBSCRIBE TO THE MAGAZINE↵LOGIN↵REGISTER↵↵NEWS↵REVIEWS↵TOP 10s↵FEATURES↵WIN↵AWARDS↵INNOVATORS↵NEWSLETTER↵TRENDING↵>> Stuff Gadget Awards 2015↵Reviews↵LATEST REVIEWS↵↵REVIEW↵04 DECEMBER 2015 / 15:24GMT↵Motorola Moto X Force review↵The only top-end phone guaranteed not to shatter↵↵REVIEW↵03 DECEMBER 2015 / 12:58GMT↵Beats Pill+ Speaker review↵The first Apple-fied Beats speaker isn't quite what the doctor ordered↵↵REVIEW↵02 DECEMBER 2015 / 13:05GMT↵Tom Clancy's Rainbow Six: Siege review↵The FPS for brainy sorts is back with a bang↵↵REVIEW↵01 DECEMBER 2015 / 0:00GMT↵Just Cause 3 review↵Destruction is its own reward in this joyful, patchy open worlder↵↵REVIEW↵30 NOVEMBER 2015 / 18:20GMT↵Microsoft Lumia 950 review↵Windows 10 struggles to get in gear↵↵REVIEW↵30 NOVEMBER 2015 / 14:59GMT↵Xenoblade Chronicles X review↵Bigger than Fallout 4 and even more unforgiving, a truly epic JRPG↵↵REVIEW↵28 NOVEMBER 2015 / 8:00GMT↵App of the week: Fugue Machine review↵This ‘Bach in a box’ iPad sequencer helps you go REALLY old-school, and in doing so create thoroughly modern electronic...↵↵REVIEW↵27 NOVEMBER 2015 / 17:45GMT↵Olympus OM-D E-M5 Mark II review↵The Second Coming of the E-M5 smashes it on both design and performance fronts↵↵REVIEW↵26 NOVEMBER 2015 / 16:57GMT↵Microsoft Surface Pro 4 review↵‘iPad Pro? That could be a problem,’ says Microsoft’s buggy new hybrid↵↵REVIEW↵25 NOVEMBER 2015 / 17:57GMT↵Canon Powershot G5 X review↵A zoom with a view(finder)↵LOAD MORE↵TOP 10 OF EVERYTHING↵↵↵SMARTPHONES↵↵↵TVS↵↵↵SMARTWATCHES↵↵↵COMPACT CAMERAS↵↵↵TABLETS↵↵See all categories↵DON'T MISS THIS↵FEATURES 01 DECEMBER 2015 / 16:55GMT↵Stuff Gadget Awards 2015 winners announced: These are the 25 best gadgets of the year↵FEATURES 03 DECEMBER 2015 / 10:57GMT↵The best iPad Pro art therapy apps for people who can’t draw↵WIN 03 DECEMBER 2015 / 12:16GMT↵Win 1 of 5 Sony Smartwatches!↵FEATURES 02 DECEMBER 2015 / 15:44GMT↵Christmas Gift Guide 2015: 330 brilliant present ideas↵NEWS 02 DECEMBER 2015 / 11:57GMT↵January issue of Stuff out now↵Login↵or↵Register↵About Stuff // Contact // LegalPrivacy Policy // AdvertiseCookie Policy // Editorial Complaint?↵Follow us↵↵Facebook↵Twitter↵G Plus↵YouTube↵Newsletter↵Subscribe to the magazine↵↵↵Subscribe now↵↵© 2015 Haymarket Media Group↵"
 pageTitle: "The latest tech and gadget reviews | Stuff"
 safeBrowsing: Object
 __proto__: Object
 */