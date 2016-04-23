'use strict'

var path = require('path')

var electron = require('electron')

var checkScreenSize = require('./checkScreenSize')
var appSettings = require('../db/appSettings')

var electronApp = electron.app
var Menu = electron.Menu
var Tray = electron.Tray
var shell = electron.shell
var ipcMain = electron.ipcMain
var BrowserWindow = electron.BrowserWindow
var platform = process.platform
var settingsWindow = null
var aboutWindow = null
var appTrayMenu = null
var devMode = process.env.NODE_ENV === 'development'
var logsFolder = path.join(electronApp.getPath('appData'), 'MarkSearch', 'logs')
var settingsWindowIcon = path.join(__dirname, 'icons', 'blue', 'MS-iconTemplate.png')
var aboutWindowWidth = 400
var aboutWindowHeight = 405

function trayMenu() {
  var appTrayIcon = path.join(__dirname, 'icons', appSettings.settings.trayIconColor, 'MS-iconTemplate.png')
  appTrayMenu = new Tray(appTrayIcon)

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Search',
      click: function() {
        shell.openExternal(global.msServerAddr.combined)
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
                icon: settingsWindowIcon,
                autoHideMenuBar: true,
                webPreferences: {
                  nodeIntegration: false
                }
              }
          )
          /****
           * Remove the menu in menu bar, so they dont accidentally exit the
           * app - on windows i think you can still access it by pressing the
           * alt key.
           */
          settingsWindow.setMenu(null)

          settingsWindow.loadURL(`${ global.msServerAddr.combined }/settings`)

          if(devMode){
            settingsWindow.openDevTools()
          }

          settingsWindow.on('closed', () => {
            settingsWindow = null
          })
        }
      }
    },
    {
      label: 'Logs',
      click: function() {
        shell.showItemInFolder(logsFolder)
      }
    },
    {
      label: 'About',
      click: () => {
        if(platform === 'win32'){
          aboutWindowHeight = 450
        }
        if(aboutWindow){
          aboutWindow.show()
        }
        else{
          aboutWindow = new BrowserWindow(
            {
              width: aboutWindowWidth,
              height: aboutWindowHeight,
              title: 'About MarkSearch',
              icon: settingsWindowIcon,
              autoHideMenuBar: true,
              resizable: false,
              maximizable: false,
              fullscreenable: false,
              titleBarStyle: 'hidden'
            }
          )
          /****
           * Remove the menu in menu bar, so they dont accidentally exit the
           * app - on windows i think you can still access it by pressing the
           * alt key.
           */
          aboutWindow.setMenu(null)

          aboutWindow.loadURL(`file://${ path.join(__dirname, 'about', 'about.html') }`)

          if(devMode){
            aboutWindow.openDevTools()
          }

          aboutWindow.on('closed', () => {
            aboutWindow = null
          })

          ipcMain.on('openAppHomePage', function() {
            aboutWindow.close()
            shell.openExternal('https://github.com/Darkle/MarkSearch')
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