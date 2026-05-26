const { app, BrowserWindow, shell, ipcMain } = require('electron')
const path = require('path')

// Stable userData path — survives reinstalls and updates
app.setPath('userData', path.join(app.getPath('appData'), 'GrimLedger'))

let autoUpdater = null
try { autoUpdater = require('electron-updater').autoUpdater } catch (_) {}

let win = null

function createWindow() {
  win = new BrowserWindow({
    width: 1280, height: 860, minWidth: 960, minHeight: 640,
    title: 'GrimLedger',
    backgroundColor: '#16101e',
    icon: path.join(__dirname, 'icon.png'),
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  })
  win.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  win.webContents.setWindowOpenHandler(({ url }) => { shell.openExternal(url); return { action: 'deny' } })
  win.webContents.on('did-finish-load', setupUpdater)
  win.on('closed', () => { win = null })
}

function setupUpdater() {
  if (!autoUpdater || !win) return
  autoUpdater.autoDownload = false
  autoUpdater.on('update-available',    (i) => win?.webContents.send('update-available', { version: i.version }))
  autoUpdater.on('update-not-available',()  => win?.webContents.send('update-not-available'))
  autoUpdater.on('download-progress',   (p) => win?.webContents.send('update-progress', p))
  autoUpdater.on('update-downloaded',   ()  => win?.webContents.send('update-downloaded'))
  autoUpdater.on('error',               (e) => win?.webContents.send('update-error', e.message))
  autoUpdater.checkForUpdates().catch(() => {})
}

ipcMain.handle('updater:check',    () => autoUpdater?.checkForUpdates().catch(e => ({ error: e.message })))
ipcMain.handle('updater:download', () => autoUpdater?.downloadUpdate())
ipcMain.handle('updater:install',  () => autoUpdater?.quitAndInstall())
ipcMain.handle('app:version',      () => app.getVersion())

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => { if (!BrowserWindow.getAllWindows().length) createWindow() })
})
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
