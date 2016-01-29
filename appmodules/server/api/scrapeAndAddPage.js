'use strict';

var path = require('path')

//var request = require('request')
//var ineed = require('ineed')
var debug = require('debug')('MarkSearch:scrapeAndAddPage')


var addPage = require(path.join(__dirname, 'addPage'))

//var Nightmare = require('nightmare')
//var vo = require('vo')
/****
 * When getting the pageText, use https://developer.mozilla.org/en-US/docs/Web/API/Node/innerText
 * it's supported by chrome - check out the "Differences from innerText" section
 * at https://developer.mozilla.org/en-US/docs/Web/API/Node/textContent ,
 * it naturally skips <script> and <style> elements
 */
/****
 * For scrapeAndAddPage, should I have it accept an array instead
 * so can add a bunch of urls in sequence
 *
 * TODO Actually no, if i use generators on the front end to call scrapeAndAddPage,
 * TODO that means both scrapeAndAddPage
 * TODO and addPage can stay simple.
 * TODO So for scrapeAndAddPage, if an error occures on scrape, return an error straight away
 *
 */
/*****
 * Note some pages have <meta name="Description" content=""> - description with D as uppercase,
 * so account for uppercase maybe do document.querySelector('meta[name="description"],
 * meta[name="Description"], meta[name="DESCRIPTION"]')
 * also check the source on http://www.tor.com/ - no <title> and meta[] are prefixed
 * To get started: https://gist.github.com/d6e3a1d75ad936685a1d
 */
/****
 * Dont need to collapse whitespace here as doing that in addPage.js
 */
/****
 *  https://github.com/ageitgey/node-unfluff - this is new, have a look at it, havent tried it yet
 *  https://github.com/ageitgey/node-unfluff/blob/master/src/extractor.coffee - makes a good point about
 *  title is sometimes not the title element
 *
 *  https://github.com/ageitgey/node-unfluff/blob/master/src/extractor.coffee#L150 - this is interesting,
 *  using stopwords to check against and find a good snippet of text
 */
/*****
 * Also, when saving pageText either from scraping or from extension, put reminders (in both
 * scrapeAndAddPage.js and in the extension note) to get rid of stuff like \t \n \r - i guess
 * the easiest thing to do would be to convert them to spaces - could I then convert any space
 * that is more than one character in length to a single character space
 */
/******
 * For the webview, should I check for a crash in the webview (aw snap)
 * https://github.com/hokein/electron-sample-apps/tree/master/webview/browser
 */
/******
 * Remember to collapse whitespace: https://github.com/jprichardson/string.js/blob/master/dist/string.js#L191
 * http://stringjs.com/#methods/collapsewhitespace - also do it for the title and description
 * Does this also get rid of \n?
 */
/****
 * Not sure if this is helpful http://electron.atom.io/docs/v0.36.4/api/ipc-renderer/#ipcrenderer-sendtohost-channel-arg1-arg2
 */
/****
 * Check the resources here (down bottom) on innerText
  * http://caniuse.com/#feat=innertext
 * And also this post: http://perfectionkills.com/the-poor-misunderstood-innerText/
 */
/****
 * Perhaps should clear both of these before close just in case:
 * http://electron.atom.io/docs/v0.36.4/api/session/#ses-clearcache-callback
 * http://electron.atom.io/docs/v0.36.4/api/session/#ses-clearstoragedata-options-callback
 */
/****
 * https://samsaffron.com/archive/2012/06/07/testing-3-million-hyperlinks-lessons-learned
 */
/****
 * When loading a page, what should I do for non 200 status codes?
 * e.g. should I throw an error on a 404 or 500?
 */
/****
 * If need https://github.com/prettydiff/getNodesByType
 */
function scrapeAndAddPage(req, res, next) {
  debug('scrapeAndAddPage running')
  debug(req.params.pageUrl)
  var urlToScrape = req.params.pageUrl
  /****
   * Once I have gotten up to the nw.js/electron bits, consider using that for the scraping
   * just open a hidden window (remembering to hide the dock icon in osx and
   *   'skip-taskbar': true,
   *   'auto-hide-menu-bar': true
   *   https://github.com/atom/electron/issues/422 - hiding the dock icon
   *   https://github.com/atom/electron/blob/master/docs/api/browser-window.md
   *   https://github.com/atom/electron/blob/master/docs/api/web-contents.md
   *   Could also check what nightmare does in its source code.
   *   Or, if i do go back to nightmare, check the issues for info: https://github.com/segmentio/nightmare/issues
   *   actuall, in this video, the guy says its only for simple stuff: https://www.youtube.com/watch?v=YNmAYnndYG0
   *   So maybe move on to one of the other ones, casper, slimer etc, perhaps go through
   *   the scraping frameworks i chose in evernote and the scraper note again
   *   then also search for blog posts and youtube videos on whatever i choose
   *   Actually, with casperjs, you can evaluate js, so you could do something similar
   *   http://docs.casperjs.org/en/latest/modules/casper.html#evaluate
   *   https://www.youtube.com/watch?v=Kefil5tCL9o
   *
   *
   *   Remember to grab the page description as well as the title and innerText
   *   (in scrape remember to account for if there is no description meta element and
   *   also if there is no content attribute on that meta element), also if there is not title
   *   element - have a look at the bookmarklet code too
   *
   */
  /***
   * When doing this using electron, will probably grab it on page load (not onDomContentLoaded), maybe add
   * an extra 2 seconds, just in case javascript is loading content.
   */
// Post the array in the post body - http://stackoverflow.com/questions/12025820/
  /****
   * Prolly should check that its an array.
   * Also, make it in to sequential, rather than parallel calls. i.e. one after the
   * other, rather than all at once.
   */
  //ineed.collect.title.texts.from(
  //    {
  //      url: urlToScrape,
  //      headers: {
  //        'User-Agent': 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  //        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  //      },
  //      followRedirect: true
  //    },
  //    function (err, response, result) {
  //      if(err){
  //        console.error(`there was an error scraping ${urlToScrape}`, err)
  //        /****
  //         * I'm gonna go with a 502 here: http://httpstatus.es/502
  //         */
  //        res.status(502).end()
  //      }
  //      else{
  //        console.log('got the page scrape')
  //        /****
  //         * adding page title and page text to req.body, so now have req.body.pageTitle
  //         * & req.body.pageText
  //         */
  //        console.log('result.title')
  //        console.log(result.title)
  //        //console.log('result.texts')
  //        //console.log(result.texts)
  //        //console.log('result.texts.join(" ")')
  //        //console.log(result.texts.join(" "))
  //        req.body.pageTitle = result.title
  //        req.body.pageText = result.texts.join(" ")
  //        /****
  //         * just temporary unitll switch to better scraper
  //         */
  //        req.body.pageDescription = 'page description'
  //        /****
  //         * IMPORTANT TODO remember that when send it off to addPage, addPage uses stuff
  //         * like req.params.pageUrl and req.body.pageTitle, so make sure that's all fine,
  //         * so how would I do it when scrapeAndAddPage receives an array of pages to scrape? Would
  //         * I send the same request object through to addPage - perhaps its better to do all the stuff
  //         * addPage does but do it here
  //         * Yeah perhaps do that, because addPage is going to want to return a response code after the
  //         * first save
  //         * I could maybe rename addPage to addSinglePage and then put the safeBrowsing request and the
  //         * archive request into its own module called postPageSave
  //         */
  //        addPage(req, res, next)
  //        debug('ineed - It worked!!!')
  //      }
  //    })


//https://github.com/segmentio/nightmare/issues/287
  //var getPrice = function* () {
  //  console.log('hello');
  //  return yield Nightmare()
  //      .goto(MY_URL)
  //      .evaluate(function () {
  //        return document.querySelectorAll('.price-total .animated')[0].innerText;
  //      });
  //};
  //var price = getPrice().next().value
  //res.status(200).json(price);
  //
  //vo(run)(function(err, result) {
  //  if (err) throw err;
  //});

  //function *run() {
  //  var nightmare = Nightmare(
  //      {
  //        show: false,
  //        'skip-taskbar': true,
  //        'auto-hide-menu-bar': true
  //        /****
  //         * for some reason this isn't working
  //         */
  //        //'web-preferences': {
  //        //  javascript: true,
  //        //  'allow-displaying-insecure-content': true,
  //        //  'allow-running-insecure-content': true
  //        //}
  //      }
  //  )
  //  var innerText = yield nightmare
  //      //.wait(5000)
  //      //.on('load', function(){
  //      //  console.log('page has loaded')
  //      //})
  //      //.goto('https://www.crunchbase.com/')
  //      .goto('http://coopcoding.com/blog/an-alternative-to-undelete-in-osx-(and-hiding-the-trash-icon-in-the-dock)/')
  //      .wait(2000)
  //      .evaluate(function() {
  //        //return document.documentElement.innerText
  //        //var returnText = {
  //        //  docTitle: document.title,
  //        //  pageText: document.documentElement.innerText
  //        //}
  //        //return returnText
  //        return document.documentElement.innerHTML
  //        //return document.addEventListener("DOMContentLoaded", function(event) {
  //        //  return "DOM fully loaded and parsed"
  //        //})
  //      })
  //  console.log('innerText')
  //  console.log(innerText)
  //  yield nightmare.end()
  //}



  //request('http://coopcoding.com/blog/an-alternative-to-undelete-in-osx-(and-hiding-the-trash-icon-in-the-dock)/', function (error, response, body) {
  //request(
  //  {
  //    //url: 'http://coopcoding.com/blog/an-alternative-to-undelete-in-osx-(and-hiding-the-trash-icon-in-the-dock)/',
  //    url: 'https://www.crunchbase.com/',
  //    headers: {
  //    'User-Agent': 'Mozilla/5.0 (Windows NT 6.3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  //    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  //    },
  //    followRedirect: true
  //  },
  //  function (error, response, body) {
  //    console.log('response************************************************************************************************************************************************')
  //
  //    console.log(response)
  //    console.log(body)
  //    console.log('body************************************************************************************************************************************************')
  //
  //    if (!error && response.statusCode === 200) {
  //      //console.log(body) // Show the HTML for the Google homepage.
  //      //console.log('cheerio************************************************************************************************************************************************')
  //      //console.log('cheerio************************************************************************************************************************************************')
  //      //console.log('cheerio************************************************************************************************************************************************')
  //      //console.log('cheerio************************************************************************************************************************************************')
  //      //var $ = cheerio.load(body)
  //      //console.log(response)
  //      //console.log(body)
  //      //console.log($('*').filter(':not(script)').text())
  //      //console.log($('body *:not(script)').text())
  //      //console.log($('*').not('script').text())
  //      //var textCHeck = $('*').map(function(i, el) {
  //      //  // this === el
  //      //
  //      //  if(el.tagName === 'style'){
  //      //    console.log(el.tagName)
  //      //    return $(this)
  //      //  }
  //      //
  //      //
  //      //})
  //      //console.log(textCHeck.find('*').text())
  //      //var doc = jQuery( body )
  //      //jQuery('style', doc).text()
  //    }
  //})



  /***
   * for phantom.electron document.documentElement.innerText
   *
   *  So we would only want to call res.status().end() if there was an error getting the page,
   *  otherwise, we call addPAge

   *  got supports redirects
   *
   *   Is there a title and description? maybe merge the two (convert toLowerCase()
   *   before checking
   *   - double check that cheerio doesnt care about case when selecting by
   *   attribute and value e.g. meta[name="Description"] vs. meta[name="description"]
   *   also check against all uppercase e.g. meta[name="DESCRIPTION"] - make sure
   *   cheerio doesnt select twice if it is case insesitive, although i guess that would
   *   mean doesnt matter to check
   *   - also remember to check if the trim() ,length is 0, then its just empty text
   *   also remember to add a space between the two texts when combining the title and
   *   description
   *   --- actually no, i think i will just prepend the description to the body text
   *   - i think also append the keywords to the end of the body text (also checking for
   *   case sensitivity if needed)
   *
   *   Remember I will have to filter out elements dont want text for
   */


}

module.exports = scrapeAndAddPage