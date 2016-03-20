'use strict';

var path = require('path')

var electron = require('electron')

var checkScreenSize = require('./checkScreenSize')

var electronApp = electron.app
var Menu = electron.Menu
var Tray = electron.Tray
var shell = electron.shell
var settingsWindow = null
var appTrayMenu = null
var devMode = process.env.NODE_ENV === 'development'
var logsFolder = path.join(electronApp.getPath('appData'), 'MarkSearch', 'logs')

function trayMenu(){
  var BrowserWindow = electron.BrowserWindow

  appTrayMenu = new Tray(path.join(__dirname, 'icons', 'MS-iconTemplate.png'))

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Search',
      click: function() {
        //TODO - get address dynamically
        shell.openExternal(`http://localhost:3020/`)
      }
    },
    {
      label: 'Settings',
      click: function() {
        if(settingsWindow){
          settingsWindow.show()
        }
        else{
          var windowSize = checkScreenSize()
          if(devMode){
            windowSize.width = 1050
            windowSize.height = 1200
          }

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
          settingsWindow.loadURL(`http://localhost:3020/settings`)
          if(devMode){
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
        //TODO - get address dynamically
        shell.openExternal(`http://localhost:3020/help`)
      }
    },
    {
      label: 'About',
      click: function() {
        //TODO - get address dynamically
        shell.openExternal(`http://localhost:3020/about`)
      }
    },
    {
      label: 'Logs',
      click: function() {
        shell.showItemInFolder(logsFolder)
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