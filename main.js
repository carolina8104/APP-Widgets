const { app, BrowserWindow } = require('electron')
const path = require('path')
const fs = require('fs')

function createWindow() {
  const window = new BrowserWindow({
    width: 1000, height: 700,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#2c2c2c',       
      symbolColor: '#FFF',    
      height: 32         
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), 
      contextIsolation: false,
    }
  })


  window.loadFile(path.join(__dirname, 'index.html'))
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
