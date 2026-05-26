const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('api', {
  getVersion:      ()   => ipcRenderer.invoke('app:version'),
  checkForUpdates: ()   => ipcRenderer.invoke('updater:check'),
  downloadUpdate:  ()   => ipcRenderer.invoke('updater:download'),
  installUpdate:   ()   => ipcRenderer.invoke('updater:install'),
  on: (ch, cb) => ipcRenderer.on(ch, (_, data) => cb(data)),
})
