'use strict'

import { csrfToken } from './searchPage'
import { queryServerAndRender } from './queryServerAndRender'
import { dateFilterResetAll, checkMatchMediaForResultsContainerMarginTop } from './dateFilter'

//noinspection Eslint
import velocity from 'velocity-animate'
import suspend from 'suspend'
import got from 'got'
import _ from 'lodash'
import validUrl from 'valid-url'

var addPageUrlsDiv$
var addPageMaterialIcon$
var progressBar$
var addUrlsTextArea$
var progressInfo$
var addUrlsProgress$
var addPageButtonsContainer$
var errorOKbutton$

function hideShowAddPageSubbar(refreshResults) {
  var dataIsShown = addPageUrlsDiv$.data('isShown')
  addUrlsTextArea$.css('overflow-y', 'hidden')
  if(dataIsShown === 'true'){
    addPageUrlsDiv$.data('isShown', 'false')
    $.Velocity(addPageUrlsDiv$[0], "slideUp", { duration: 500, display: 'none' })
        .then(() => {
          progressBar$.width(0)
          addUrlsTextArea$.removeClass('hide')
          addUrlsProgress$.addClass('hide')
          addPageButtonsContainer$.removeClass('hide')
          progressInfo$.addClass('hide')
          progressInfo$.css('overflow-y', 'visible')
          errorOKbutton$.addClass('hide')
          addUrlsTextArea$.val('')
          addPageMaterialIcon$.removeClass('navBar-materialIcon-selected')
          if(refreshResults){
            queryServerAndRender()
          }
        })
  }
  else{
    addPageUrlsDiv$.data('isShown', 'true')
    addPageMaterialIcon$.addClass('navBar-materialIcon-selected')
    $.Velocity(addPageUrlsDiv$[0], "slideDown", { duration: 500, display: 'flex' })
        .then(() => {
          addUrlsTextArea$.css('overflow-y', '')
        })
  }
}

function addUrlsInit() {
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
          .then(() => {
            currentlyShownSubBar$.data('isShown', 'false')
            otherNavMaterialIcons$.removeClass('navBar-materialIcon-selected navBar-materialIcon-hover')
            /****
             * If hiding the date filter subbar, reset the results and the settings in the date filter module
             */
            if(currentlyShownSubBar$.hasClass('dateFilterSettings')){
              dateFilterResetAll()
            }
            var refreshResults = false
            hideShowAddPageSubbar(refreshResults)
          })
    }
    /****
     * Else show/hide the addPage subbar
     */
    else {
      var refreshResults = false
      hideShowAddPageSubbar(refreshResults)
    }
  })
  $('.urlCancelButton').click(() => {
    var refreshResults = false
    hideShowAddPageSubbar(refreshResults)
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
           * Grab all the text in the textarea, then split it into an array
           * and check that it's not an empty string
           */
          var textAreaText = addUrlsTextArea$.val()
          var linesOfTextArray = textAreaText.split(/\r?\n/)
          var trimmedUrlsArray = linesOfTextArray.filter(lineOfText => validUrl.isWebUri(_.trim(lineOfText)))
          if(trimmedUrlsArray.length < 1){
            return
          }
          //addUrlsProgress$.height(addPageButtonsContainer$.height())
          addUrlsTextArea$.toggleClass('hide')
          addUrlsTextArea$.val('')
          progressInfo$.css('height', textAreaHeight)
          setTimeout(() => {
            //progressInfo$.velocity({ height: 35 }, 500)
            $.Velocity.animate(progressInfo$[0], {height: 35}, 500)
              .then(() => {
                progressInfo$.css('height', '')
              })
          }, 10)
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

          suspend(function* () {
            var error
            var urlsThatErrored = []
            for(var i = 0; i < trimmedUrlsArray.length; i++){
              progressInfo$.text(`Saving ${ trimmedUrlsArray[i] }`)
              $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*(i+1))}, 4000, 'easeOutSine')
              var encodedUrl = encodeURIComponent(trimmedUrlsArray[i])
              try{
                yield got.post(`/frontendapi/scrapeAndAdd/${ encodedUrl }`, {headers: {'X-CSRF-Token': csrfToken}})
              }
              catch(err){
                console.error(err)
                error = err
                var errMessage = ''
                var responseBody = _.get(error, 'response.body')
                var parsedResponseBody
                if(responseBody.length){
                  try{
                    parsedResponseBody = JSON.parse(responseBody)
                  }
                  catch(e){
                    // do nothing
                  }
                }
                if(_.get(parsedResponseBody, 'errorMessage')){
                  errMessage = parsedResponseBody.errorMessage
                }
                else if(_.get(parsedResponseBody, 'errMessage')){
                  errMessage = parsedResponseBody.errMessage
                }
                urlsThatErrored.push({
                  url: trimmedUrlsArray[i],
                  errMessage: errMessage
                })
              }
            }
            if(error){
              progressBar$.velocity("stop")
              progressBar$.width(progressBarContainerWidth)
              progressInfo$.text(``)
              progressInfo$.css(`overflow-y`, `scroll`)
              errorOKbutton$.width(progressBarContainerWidth)
              errorOKbutton$.removeClass('hide')
              progressBar$.addClass('hide')
              var ul$ = $('<ul>')
              var errorTextBeginning = ``
              if(urlsThatErrored.length !== trimmedUrlsArray.length){
                errorTextBeginning = `Most URLs Saved, However `
              }
              $(`<li>${ errorTextBeginning }Errors Occured While Saving The Following URLs:</li>`).appendTo(ul$)
              for(var errUrl of urlsThatErrored){
                $(`<li class="failedUrlInfo">${ errUrl.url } - reason: ${ errUrl.errMessage }</li>`).appendTo(ul$)
              }
              progressInfo$.append(ul$)
            }
            else{
              progressBar$.velocity("stop")
              $.Velocity.animate(progressBar$[0], {width: progressBarContainerWidth}, 10, 'easeOutExpo')
              progressInfo$.text(`All URLs Saved`)
              window.setTimeout(() => {
                var refreshResults = true
                hideShowAddPageSubbar(refreshResults)
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
  errorOKbutton$.click(() => {
    var refreshResults = true
    hideShowAddPageSubbar(refreshResults)
  })
}
/****
 * Exports
 */
export { addUrlsInit }
