// electron/main.cjs  — CommonJS, required by Electron
const { app, BrowserWindow, shell } = require('electron')
const path = require('path')

// Keep reference so GC doesn't close the window
let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 820,
    minWidth: 800,
    minHeight: 600,
    title: 'GrimLedger',
    backgroundColor: '#0d0b08',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    // Use built-in icon path; GitHub Actions will provide the real icon
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
  })

  // In production load the built index.html
  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  mainWindow.loadFile(indexPath)

  // Open external links in browser, not in Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
