'use strict';

/* globals rows, buttonplate notie */
import "babel-polyfill"
import got from 'got'

$(document).ready(settingsPageInit)

function settingsPageInit(event){
  var csrfToken = $('#csrfInput').val()
  var rowsUl$ = $('#rowsUl')
  buttonplate($('.deleteBookmark'))

  rows.forEach(row => {
    /*****
     * If there's no pageTitle text, then just use the page url
     */
    var pageTitle = ''
    if(row.pageTitle){
      pageTitle = row.pageTitle.trim()
    }
    pageTitle = (pageTitle.length > 0) ? pageTitle : row.pageUrl
    rowsUl$.append(`
              <li class="bookmarkDetailsContainer">
                <div class="deleteBookmarkButtonContainer">
                  <a href="${row.pageUrl}" class="deleteBookmarkButton button black square">Delete</a>
                </div>
                <div class="bookmarkDetails">
                  <a href="${row.pageUrl}" target="_blank">${pageTitle}</a>
                  <div class="bookmarkPageUrl">${row.pageUrl}</div>
                </div>
              </li>
    `)
  })
  $('.deleteBookmarkButton').click(event => {
    event.preventDefault()
    var currentElement = event.currentTarget
    var urlToDelete = encodeURIComponent($(currentElement).attr('href'))
    var elemBookmarkDetailsContainer = $(currentElement).parent().parent()
    got.delete(`/frontendapi/remove/${urlToDelete}`,
      {
        headers:
        {
          'X-CSRF-Token': csrfToken
        }
      })
      .then( response =>{
        elemBookmarkDetailsContainer.animate({height: "toggle"}, 400, () => {
          elemBookmarkDetailsContainer.remove()
        })
      })
      .catch(err => {
        console.error(err)
        $('#notie-alert-outer').addClass('notie-alert-error')
        notie.alert(
          3,
          `There Was An Error Deleting The Bookmark
           Error: ${err.message}`,
          5
        )
      })
  })
}

