import { contextBridge, ipcRenderer } from 'electron'

const electronAPI = {
  // Window controls
  window: {
    minimize: () => ipcRenderer.invoke('window:minimize'),
    maximize: () => ipcRenderer.invoke('window:maximize'),
    close: () => ipcRenderer.invoke('window:close'),
    isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  },

  // Config operations
  config: {
    get: (key?: string) => ipcRenderer.invoke('config:get', key),
    set: (key: string, value: any) => ipcRenderer.invoke('config:set', key, value),
  },

  // Models operations
  models: {
    getAll: () => ipcRenderer.invoke('models:getAll'),
    save: (data: any) => ipcRenderer.invoke('models:save', data),
    add: (model: any) => ipcRenderer.invoke('models:add', model),
    update: (modelId: string, updates: any) => ipcRenderer.invoke('models:update', modelId, updates),
    delete: (modelId: string) => ipcRenderer.invoke('models:delete', modelId),
  },

  // Conversations operations
  conversations: {
    getAll: () => ipcRenderer.invoke('conversations:getAll'),
    get: (id: string) => ipcRenderer.invoke('conversations:get', id),
    save: (id: string, data: any) => ipcRenderer.invoke('conversations:save', id, data),
    delete: (id: string) => ipcRenderer.invoke('conversations:delete', id),
  },

  // Shell operations
  shell: {
    openExternal: (url: string) => ipcRenderer.invoke('shell:openExternal', url),
    showItemInFolder: (path: string) => ipcRenderer.invoke('shell:showItemInFolder', path),
    openPath: (path: string) => ipcRenderer.invoke('shell:openPath', path),
  },

  // Dialog operations
  dialog: {
    selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
    selectFiles: () => ipcRenderer.invoke('dialog:selectFiles'),
    readFileContent: (filePath: string) => ipcRenderer.invoke('dialog:readFileContent', filePath),
  },

  // Tasks operations
  tasks: {
    getAll: () => ipcRenderer.invoke('tasks:getAll'),
    save: (data: any) => ipcRenderer.invoke('tasks:save', data),
  },

  // Agent tools
  agent: {
    readFile: (root: string, relPath: string) => ipcRenderer.invoke('agent:readFile', root, relPath),
    writeFile: (root: string, relPath: string, content: string) => ipcRenderer.invoke('agent:writeFile', root, relPath, content),
    editFile: (root: string, relPath: string, oldStr: string, newStr: string) => ipcRenderer.invoke('agent:editFile', root, relPath, oldStr, newStr),
    appendFile: (root: string, relPath: string, content: string) => ipcRenderer.invoke('agent:appendFile', root, relPath, content),
    deleteFile: (root: string, relPath: string) => ipcRenderer.invoke('agent:deleteFile', root, relPath),
    listFiles: (root: string, relPath?: string) => ipcRenderer.invoke('agent:listFiles', root, relPath ?? ''),
    searchFiles: (root: string, relPath: string, pattern: string, isRegex?: boolean) => ipcRenderer.invoke('agent:searchFiles', root, relPath, pattern, isRegex ?? false),
    findFiles: (root: string, pattern: string) => ipcRenderer.invoke('agent:findFiles', root, pattern),
    execCommand: (root: string, command: string, timeoutMs?: number) => ipcRenderer.invoke('agent:execCommand', root, command, timeoutMs),
  },

  // File system operations
  fs: {
    readDirTree: (dirPath: string) => ipcRenderer.invoke('fs:readDirTree', dirPath),
  },

  // App info
  app: {
    getInfo: () => ipcRenderer.invoke('app:getInfo'),
    clearAllData: () => ipcRenderer.invoke('app:clearAllData'),
    notify: (title: string, body: string) => ipcRenderer.invoke('app:notify', title, body),
  },
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

export type ElectronAPI = typeof electronAPI
