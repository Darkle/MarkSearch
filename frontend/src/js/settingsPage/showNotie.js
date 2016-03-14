'use strict';

import { notieAlert$ } from './settingsPage'

import notie from 'notie'

function showNotie(classToAdd, alertType, alertMessage, duration){
  notieAlert$.removeClass('notie-alert-success notie-alert-error')
  notieAlert$.addClass(classToAdd)
  notie.alert(alertType, alertMessage, duration)
}

export { showNotie }