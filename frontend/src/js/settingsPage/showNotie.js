'use strict';

import notie from 'notie'

function showNotie(notieElement, classToAdd, alertType, alertMessage, duration){
  notieElement.removeClass('notie-alert-success notie-alert-error')
  notieElement.addClass(classToAdd)
  notie.alert(alertType, alertMessage, duration)
}

export { showNotie }