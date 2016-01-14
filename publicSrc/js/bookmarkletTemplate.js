'use strict';

function generateBookmarkletJS(locationHostAndProtocol, token){
  return `
      (function(){

      var form = document.createElement('form');
      form.setAttribute('style', 'display: none !important;');
      form.setAttribute('method', 'POST');
      form.setAttribute('acceptCharset', 'utf8');
      form.setAttribute('enctype', 'multipart/form-data');
      //dynamically set by MarkSearch settings page
      form.setAttribute('action', '${locationHostAndProtocol}/api/add/'+encodeURIComponent(window.location));

      var jwtInput = document.createElement('input');
      jwtInput.setAttribute('type', 'text');
      jwtInput.setAttribute('name', 'JWT');
      //dynamically set by MarkSearch settings page
      jwtInput.value = ${token};
      form.appendChild(jwtInput);

      var pageTitleInput = document.createElement('input');
      pageTitleInput.setAttribute('type', 'text');
      pageTitleInput.setAttribute('name', 'pageTitle');
      var titleElem = document.querySelector('head meta[property="og:title"], head title');
      pageTitleInput.value = '';
      if(titleElem.hasAttribute('content')){
        pageTitleInput.value = titleElem.getAttribute('content');
      }
      else{
        pageTitleInput.value = titleElem.textContent;
      }
      form.appendChild(pageTitleInput);

      var pageTextInput = document.createElement('input');
      pageTextInput.setAttribute('type', 'text');
      pageTextInput.setAttribute('name', 'pageText');
      pageTextInput.value = document.body.innerText;
      form.appendChild(pageTextInput);

      var pageDescriptionInput = document.createElement('input');
      pageDescriptionInput.setAttribute('type', 'text');
      pageDescriptionInput.setAttribute('name', 'pageDescription');
      pageDescriptionInput.value = pageTitleInput.value;
      var descriptionSelectors = 'head meta[name="description"],'+
                                  ' head meta[name="Description"],'+
                                  ' head meta[name="DESCRIPTION"],'+
                                  ' head meta[property="og:description"]';
      var descriptionElement = document.querySelector(descriptionSelectors)
      if(descriptionElement && descriptionElement.hasAttribute('content')){
        pageDescriptionInput.value = descriptionElement.getAttribute('content');
      }
      form.appendChild(pageDescriptionInput);

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);

      //create notification div
      var notificationDiv = document.createElement('div')


    })();
  `
}

export { generateBookmarkletJS }