// electron/preload.cjs
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Version
  getVersion: () => ipcRenderer.invoke('get-version'),

  // Updater actions
  checkForUpdates:  () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate:   () => ipcRenderer.invoke('download-update'),
  installUpdate:    () => ipcRenderer.invoke('install-update'),

  // Updater events (renderer listens to these)
  onUpdateAvailable:    (cb) => ipcRenderer.on('update-available',         (_, d) => cb(d)),
  onUpdateNotAvailable: (cb) => ipcRenderer.on('update-not-available',     ()     => cb()),
  onDownloadProgress:   (cb) => ipcRenderer.on('update-download-progress', (_, d) => cb(d)),
  onUpdateDownloaded:   (cb) => ipcRenderer.on('update-downloaded',        ()     => cb()),
  onUpdateError:        (cb) => ipcRenderer.on('update-error',             (_, m) => cb(m)),
})
