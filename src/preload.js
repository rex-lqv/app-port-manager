const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getAllPorts: () => ipcRenderer.invoke('get-all-ports'),
  getPortInfo: (port) => ipcRenderer.invoke('get-port-info', port),
  killProcess: (pid) => ipcRenderer.invoke('kill-process', pid),
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
});
