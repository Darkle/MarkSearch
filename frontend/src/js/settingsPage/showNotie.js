'use strict'

/* global notie  */

import { notieAlert$ } from './settingsPage'

function showNotie(alertType, alertMessage, duration) {
  var classToAdd = alertType === 3 ? 'notie-alert-error' : 'notie-alert-success'
  notieAlert$.removeClass('notie-alert-success notie-alert-error')
  notieAlert$.addClass(classToAdd)
  notie.alert(alertType, alertMessage, duration)
}

export { showNotie }