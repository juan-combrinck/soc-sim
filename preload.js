const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('socdesk', { flash: () => ipcRenderer.send('flash') });
