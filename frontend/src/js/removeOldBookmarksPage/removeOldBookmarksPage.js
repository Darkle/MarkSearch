'use strict';

/* globals rows, buttonplate, notie */
import "babel-polyfill"
import got from 'got'
import DOMPurify from 'dompurify'
import moment from 'moment'
import _ from 'lodash'

$(document).ready(removeOldBookmarksPageInit)

function removeOldBookmarksPageInit(event){
  var csrfToken = $('#csrfInput').val()
  var rowsUl$ = $('#rowsUl')
  buttonplate($('.deleteBookmark'))

  got.post('/frontendapi/getExpiredBookmarks/', {headers: {'X-CSRF-Token': csrfToken}})
    .then( response => {
      var rows = JSON.parse(response.body)

      rows.forEach(row => {
        /*****
         * If there's no pageTitle text, then just use the page url
         */
        var pageTitle = _.trim(_.get(row, 'pageTitle.length') ? row.pageTitle : row.pageUrl)
        rowsUl$.append(`
          <li class="bookmarkDetailsContainer">
            <div class="deleteBookmarkButtonContainer">
              <a href="${row.pageUrl}" class="deleteBookmarkButton button black square">Delete</a>
            </div>
            <div class="bookmarkDetails">
              <a href="${row.pageUrl}" target="_blank">${DOMPurify.sanitize(pageTitle)}</a>
              <div class="bookmarkPageUrl">${DOMPurify.sanitize(row.pageUrl)}</div>
              <div class="dateCreated">Date Created: ${DOMPurify.sanitize(moment(row.dateCreated).format("dddd, MMMM Do YYYY, h:mm:ss a"))}</div>
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

    })
    .catch( err => {
      console.error(err)
    })
}

