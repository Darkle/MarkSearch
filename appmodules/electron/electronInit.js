'use strict';

var debug = require('debug')('MarkSearch:electronInit')

function electronInit(electron, electronApp){
  return new Promise((resolve, reject) =>{
    var BrowserWindow = electron.BrowserWindow
    var settingsWindow = null
    var helpWindow = null
    var aboutWindow = null

    electron.crashReporter.start()

    if(electronApp.makeSingleInstance(() => true)){
      debug('Marksearch Is Already Running')
      electronApp.quit()
      reject()
    }

    electronApp.on('window-all-closes', () =>{
      if(process.platform !== 'darwin'){
        electronApp.quit()
      }
    })

    electronApp.on('ready', () =>{
      settingsWindow = new BrowserWindow(
          {
            width: 1024,
            height: 768,
            title: 'MarkSearch Settings Page'
          }
      )
      //TODO - get address dynamically
      //TODO - remove settimeout
      setTimeout(event =>{
        settingsWindow.loadURL(`http://localhost:3020/settingsPage`)
        settingsWindow.openDevTools()
      }, 2000)
      //settingsWindow.loadURL(`http://google.com`)


      settingsWindow.on('closed', () =>{
        settingsWindow = null
      })
      resolve(true)
    })
  })
}

module.exports = electronInit



