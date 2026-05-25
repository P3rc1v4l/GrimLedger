// electron/main.cjs
const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')

// electron-updater is a runtime dep — guard for dev environments
let autoUpdater = null
try {
  autoUpdater = require('electron-updater').autoUpdater
} catch (_) {}

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 650,
    title: 'GrimLedger',
    backgroundColor: '#080608',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })

  const indexPath = path.join(__dirname, '..', 'dist', 'index.html')
  mainWindow.loadFile(indexPath)

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })

  mainWindow.on('closed', () => { mainWindow = null })

  // Start update check after window is ready
  mainWindow.webContents.on('did-finish-load', () => {
    setupUpdater()
  })
}

function setupUpdater() {
  if (!autoUpdater) return

  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true

  autoUpdater.on('update-available', (info) => {
    if (mainWindow) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate,
      })
    }
  })

  autoUpdater.on('update-not-available', () => {
    if (mainWindow) mainWindow.webContents.send('update-not-available')
  })

  autoUpdater.on('download-progress', (progress) => {
    if (mainWindow) mainWindow.webContents.send('update-download-progress', progress)
  })

  autoUpdater.on('update-downloaded', () => {
    if (mainWindow) mainWindow.webContents.send('update-downloaded')
  })

  autoUpdater.on('error', (err) => {
    if (mainWindow) mainWindow.webContents.send('update-error', err.message)
  })

  // Auto-check on launch (silent)
  autoUpdater.checkForUpdates().catch(() => {})
}

// IPC handlers — called from the renderer via preload
ipcMain.handle('check-for-updates', () => {
  if (!autoUpdater) return { error: 'Updater nicht verfügbar' }
  return autoUpdater.checkForUpdates().catch((e) => ({ error: e.message }))
})

ipcMain.handle('download-update', () => {
  if (!autoUpdater) return
  autoUpdater.downloadUpdate()
})

ipcMain.handle('install-update', () => {
  if (!autoUpdater) return
  autoUpdater.quitAndInstall()
})

ipcMain.handle('get-version', () => app.getVersion())

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
