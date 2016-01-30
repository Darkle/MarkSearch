'use strict';

var path = require('path')

var electron = require('electron')
var envs = require('envs')

var checkScreenSize = require(path.join(__dirname, 'checkScreenSize'))

var electronApp = electron.app
var Menu = electron.Menu
var Tray = electron.Tray
var settingsWindow = null
var helpWindow = null
var aboutWindow = null
var appTrayMenu = null

function trayMenu(){
  var BrowserWindow = electron.BrowserWindow

  appTrayMenu = new Tray(path.join(__dirname, 'icons', 'MS-iconTemplate.png'))

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Settings',
      click: function() {
        if(settingsWindow){
          settingsWindow.show()
        }
        else{
          var windowSize = checkScreenSize()

          settingsWindow = new BrowserWindow(
              {
                width: windowSize.width,
                height: windowSize.height,
                title: 'MarkSearch Settings',
                webPreferences: {
                  nodeIntegration: false
                }
              }
          )
          //TODO - get address dynamically
          settingsWindow.loadURL(`http://localhost:3020/settingsPage`)
          if(envs('NODE_ENV') === 'development'){
            settingsWindow.openDevTools()
          }

          settingsWindow.on('closed', () =>{
            settingsWindow = null
          })
        }
      }
    },
    {
      label: 'Help',
      click: function() {
        if(helpWindow){
          helpWindow.show()
        }
        else{
          var windowSize = checkScreenSize()

          helpWindow = new BrowserWindow(
              {
                width: windowSize.width,
                height: windowSize.height,
                title: 'MarkSearch Help',
                webPreferences: {
                  nodeIntegration: false
                }
              }
          )

          helpWindow.loadURL(`http://localhost:3020/help`)
          if(envs('NODE_ENV') === 'development'){
            helpWindow.openDevTools()
          }

          helpWindow.on('closed', () =>{
            helpWindow = null
          })
        }
      }
    },
    {
      label: 'About',
      click: function() {
        if(aboutWindow){
          aboutWindow.show()
        }
        else{
          var windowSize = checkScreenSize()

          aboutWindow = new BrowserWindow(
              {
                width: windowSize.width,
                height: windowSize.height,
                title: 'MarkSearch About',
                webPreferences: {
                  nodeIntegration: false
                }
              }
          )
          aboutWindow.loadURL(`http://localhost:3020/about`)
          if(envs('NODE_ENV') === 'development'){
            aboutWindow.openDevTools()
          }

          aboutWindow.on('closed', () =>{
            aboutWindow = null
          })
        }
      }
    },
    {
      type: 'separator',
    },
    {
      label: 'Quit MarkSearch',
      click: function() {
        electronApp.quit()
      }
    }
  ])
  appTrayMenu.setToolTip('MarkSearch Settings & Help')
  appTrayMenu.setContextMenu(contextMenu)
}

module.exports = trayMenu