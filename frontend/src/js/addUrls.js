'use strict';

import velocity from 'velocity-animate'
import suspend from 'suspend'
import got from 'got'
import _ from 'lodash'

import { csrfToken } from './searchPage'
import { searchErrorHandler } from './searchErrorsHandler'
import { queryServerAndRender } from './queryServerAndRender'
import { removeResults } from './removeResults'
import { dateFilterResetAll, checkMatchMediaForResultsContainerMarginTop } from './dateFilter'

var addPageUrlsDiv$
var addPageMaterialIcon$
var progressBar$
var addUrlsTextArea$
var progressInfo$
var addUrlsProgress$
var addPageButtonsContainer$
var errorOKbutton$

function hideShowAddPageSubbar(refreshResults){
  var dataIsShown = addPageUrlsDiv$.data('isShown')
  addUrlsTextArea$.css('overflow-y', 'hidden')
  if(dataIsShown === 'true'){
    addPageUrlsDiv$.data('isShown', 'false')
    $.Velocity(addPageUrlsDiv$[0], "slideUp", { duration: 500, display: 'none' })
        .then(elements => {
          progressBar$.width(0)
          addUrlsTextArea$.removeClass('hide')
          addUrlsProgress$.addClass('hide')
          addPageButtonsContainer$.removeClass('hide')
          progressInfo$.addClass('hide')
          progressInfo$.css('overflow-y', 'visible')
          errorOKbutton$.addClass('hide')
          addUrlsTextArea$.val('')
          console.log("slideUp end")
          addPageMaterialIcon$.removeClass('navBar-materialIcon-selected')
          if(refreshResults){
            removeResults()
            queryServerAndRender().catch(searchErrorHandler)
          }
        })
  }
  else{
    addPageUrlsDiv$.data('isShown', 'true')
    addPageMaterialIcon$.addClass('navBar-materialIcon-selected')
    $.Velocity(addPageUrlsDiv$[0], "slideDown", { duration: 500, display: 'flex' })
        .then(elements => {
          addUrlsTextArea$.css('overflow-y', '')
        })
  }
}

function addUrlsInit(){
  var subBar$ = $('.subBar')
  var nav$ = $('.navHeader nav')
  var resultsOuterContainer$ = $('#resultsOuterContainer')
  addPageButtonsContainer$ = $('.addPageButtons')
  addPageUrlsDiv$ = $('.addPageUrls')
  addUrlsTextArea$ = $('textarea', addPageUrlsDiv$)
  var textAreaHeight
  progressBar$ = $('.progressBar', addUrlsProgress$)
  errorOKbutton$ = $('.errorOKbutton')
  var addPage$ = $('.addPage a')
  addPageMaterialIcon$ = $('.material-icons', addPage$)
  var otherNavMaterialIcons$ = $('.dateFilter .material-icons, .settings-etal .material-icons', nav$)
  addPage$.click(event => {
    event.preventDefault()
    /****
     * Have the textarea be about a quarter of the height of the page (minus nav and buttons),
     * but no less than 40px and no more than about 170px
     */
    var winHeightMinusNavAndButtons = $(window).height() - (nav$.height() + addPageButtonsContainer$.height())
    textAreaHeight = Math.round(0.25 * winHeightMinusNavAndButtons)
    if(textAreaHeight < 40){
      textAreaHeight = 40
    }
    if(textAreaHeight > 170){
      textAreaHeight = 170
    }
    addUrlsTextArea$.height(textAreaHeight)
    var currentlyShownSubBar$ = subBar$.children()
        .filter( (index, elem) => $(elem).data('isShown') === 'true')
    /****
     * If there is a subBar being shown and it is not the addPageUrlsDiv$, then
     * hide it and show the addPageUrlsDiv$
     */
    if(currentlyShownSubBar$[0] && currentlyShownSubBar$[0] !== addPageUrlsDiv$[0]){
      addPageMaterialIcon$.addClass('navBar-materialIcon-selected')
      if(currentlyShownSubBar$.hasClass('dateFilterSettings')){
        $.Velocity(resultsOuterContainer$[0], { marginTop: checkMatchMediaForResultsContainerMarginTop() }, 500)
      }
      $.Velocity(currentlyShownSubBar$[0], "slideUp", { duration: 500, display: 'none' })
          .then(elems => {
            currentlyShownSubBar$.data('isShown','false')
            otherNavMaterialIcons$.removeClass('navBar-materialIcon-selected navBar-materialIcon-hover')
            /****
             * If hiding the date filter subbar, reset the results and the settings in the date filter module
             */
            if(currentlyShownSubBar$.hasClass('dateFilterSettings')){
              dateFilterResetAll()
            }
            hideShowAddPageSubbar()
          })
    }
    /****
     * Else show/hide the addPage subbar
     */
    else {
      hideShowAddPageSubbar()
    }
  })
  $('.urlCancelButton').click(event => {
    hideShowAddPageSubbar(null)
  })
  addUrlsProgress$ = $('.addUrlsProgress')
  progressInfo$ = $('.progressInfo', addPageUrlsDiv$)
  /****
   * Throttle in case they accidentally double click/tap
   */
  $('.urlSaveButton').click(
      _.throttle(
        () => {
          /****
           * Grab all the text in the textarea, then split them into an array
           * and check that it's not an empty string
           */
          var textAreaText = addUrlsTextArea$.val()
          var linesOfTextArray = textAreaText.split(/\r?\n/)
          var trimmedUrlsArray = linesOfTextArray.filter(lineOfText => $.trim(lineOfText).length)
          if(trimmedUrlsArray.length < 1) {
            return
          }
          //addUrlsProgress$.height(addPageButtonsContainer$.height())
          addUrlsTextArea$.toggleClass('hide')
          addUrlsTextArea$.val('')
          progressInfo$.height(textAreaHeight)
          progressInfo$.toggleClass('hide')
          addPageButtonsContainer$.toggleClass('hide')
          addUrlsProgress$.toggleClass('hide')
          progressBar$.removeClass('hide')
          var progressBarContainerWidth = addUrlsProgress$.width()
          var progressStepAmount = progressBarContainerWidth/trimmedUrlsArray.length
          /****
           * Add a little bit of progress (about a quarter of the first step)
           * to show the user that it has started
           * http://julian.com/research/velocity/#easing
           * http://easings.net/
           */
          $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*0.25)}, 3000, 'easeOutExpo')

          suspend(function*() {
            var error
            var urlsThatErrored = []
            for(var i = 0; i < trimmedUrlsArray.length; i++) {
              progressInfo$.text(`Saving ${trimmedUrlsArray[i]}`)
              var encodedUrl = encodeURIComponent(trimmedUrlsArray[i])
              try{
                var result = yield got.post(`/indexPage_scrapeAndAdd/${encodedUrl}`, {headers: {'X-CSRF-Token': csrfToken}})
              }
              catch(err){
                console.error(err)
                error = err
                urlsThatErrored.push(trimmedUrlsArray[i])
              }
              $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*(i+1))}, 1000, 'easeOutSine')
            }
            var readTime = 2500
            if(error){
              progressBar$.velocity("stop")
              progressBar$.width(progressBarContainerWidth)
              progressInfo$.text(``)
              progressInfo$.css(`overflow-y`, `scroll`)
              errorOKbutton$.width(progressBarContainerWidth)
              errorOKbutton$.removeClass('hide')
              progressBar$.addClass('hide')
              readTime = 6000
              var ul$ = $('<ul>')
              var errorTextBeginning = ``
              if(urlsThatErrored.length !== trimmedUrlsArray.length){
                errorTextBeginning = `Most URLs Saved, However `
              }
              var il1$ = $(`<li>${errorTextBeginning}Errors Occured While Saving The Following URLs:</li>`).appendTo(ul$)
              for(var errUrl of urlsThatErrored){
                $(`<li>${errUrl}</li>`).appendTo(ul$)
              }
              progressInfo$.append(ul$)
            }
            else{
              $.Velocity.animate(progressBar$[0], {width: progressBarContainerWidth}, 10, 'easeOutExpo')
              progressInfo$.text(`All URLs Saved`)
              window.setTimeout(ev => {
                hideShowAddPageSubbar(true)
              }, 2500)
            }
          })()
          
        },
        3000,
        {
          'leading': true,
          'trailing': false
        }
      )
  )
  errorOKbutton$.click(event => {
    hideShowAddPageSubbar(true)
  })
}
/****
 * Exports
 */
export { addUrlsInit }
