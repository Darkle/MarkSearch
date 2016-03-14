'use strict';

import { xhrHeaders, progressBar$, addUrlsProgress$, progressInfo$, errorOKbutton$ } from './settingsPage'
import { hidePageSubbarAndReset } from './hideShowAddPageSubbar'

import suspend from 'suspend'
import _ from 'lodash'
import got from 'got'

/****
 * @param urlsToSave - Set()
 */
function saveUrls(urlsToSave){
  suspend(function*(urlsToSave){
    var progressBarContainerWidth = addUrlsProgress$.width()
    var urlsThatErrored = []
    var progressStepAmount = progressBarContainerWidth/urlsToSave.size
    var error
    var index = 0
    progressBar$.velocity("stop")
    progressBar$.width(0)
    progressBar$.removeClass('hide')

    for(var url of urlsToSave) {
      progressInfo$.text(`Saving ${url}`)
      $.Velocity.animate(progressBar$[0], {width: (progressStepAmount*(index+1))}, 4000, 'easeInOutCubic')
      index = index + 1
      var encodedUrl = encodeURIComponent(url)
      try{
        yield got.post(`/frontendapi/scrapeAndAdd/${encodedUrl}`, {headers: xhrHeaders})
      }
      catch(err){
        console.error(err)
        error = err
        var errMessage = _.get(error, 'response.body') || ''
        if(errMessage){
          errMessage = JSON.parse(errMessage).errorMessage
        }
        urlsThatErrored.push({
          url: url,
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
      if(urlsThatErrored.length !== urlsToSave.size){
        errorTextBeginning = `Most URLs Saved, However `
      }
      $(`<li>${errorTextBeginning}Errors Occured While Saving The Following URLs:</li>`).appendTo(ul$)
      for(var errUrl of urlsThatErrored){
        $(`<li>${errUrl.url} - reason: ${errUrl.errMessage}</li>`).appendTo(ul$)
      }
      progressInfo$.append(ul$)
    }
    else{
      progressBar$.velocity("stop")
      $.Velocity.animate(progressBar$[0], {width: progressBarContainerWidth}, 10, 'easeOutExpo')
      progressInfo$.text(`All URLs Saved`)
      window.setTimeout(ev => {
        hidePageSubbarAndReset()
      }, 3500)
    }
  })(urlsToSave)
}

export { saveUrls }




