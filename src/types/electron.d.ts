export interface ElectronAPI {
  window: {
    minimize: () => Promise<void>
    maximize: () => Promise<void>
    close: () => Promise<void>
    isMaximized: () => Promise<boolean>
  }
  config: {
    get: (key?: string) => Promise<any>
    set: (key: string, value: any) => Promise<boolean>
  }
  models: {
    getAll: () => Promise<{ models: any[]; providers: any[] }>
    save: (data: any) => Promise<boolean>
    add: (model: any) => Promise<boolean>
    update: (modelId: string, updates: any) => Promise<boolean>
    delete: (modelId: string) => Promise<boolean>
  }
  conversations: {
    getAll: () => Promise<any[]>
    get: (id: string) => Promise<any>
    save: (id: string, data: any) => Promise<boolean>
    delete: (id: string) => Promise<boolean>
  }
  shell: {
    openExternal: (url: string) => Promise<void>
    showItemInFolder: (path: string) => Promise<void>
    openPath: (path: string) => Promise<void>
  }
  dialog: {
    selectFolder: () => Promise<string | null>
    selectFiles: () => Promise<string[]>
    readFileContent: (filePath: string) => Promise<{ ok: boolean; content?: string; error?: string }>
  }
  tasks: {
    getAll: () => Promise<any[]>
    save: (data: any) => Promise<boolean>
  }
  agent: {
    readFile: (root: string, relPath: string) => Promise<{ ok: boolean; content?: string; error?: string }>
    writeFile: (root: string, relPath: string, content: string) => Promise<{ ok: boolean; error?: string }>
    editFile: (root: string, relPath: string, oldStr: string, newStr: string) => Promise<{ ok: boolean; replaced?: number; error?: string }>
    appendFile: (root: string, relPath: string, content: string) => Promise<{ ok: boolean; error?: string }>
    deleteFile: (root: string, relPath: string) => Promise<{ ok: boolean; error?: string }>
    listFiles: (root: string, relPath?: string) => Promise<{ ok: boolean; items?: Array<{ name: string; isDir: boolean; size: number }>; error?: string }>
    searchFiles: (root: string, relPath: string, pattern: string, isRegex?: boolean) => Promise<{ ok: boolean; matches?: Array<{ file: string; line: number; text: string }>; truncated?: boolean; error?: string }>
    findFiles: (root: string, pattern: string) => Promise<{ ok: boolean; files?: string[]; truncated?: boolean; error?: string }>
    execCommand: (root: string, command: string, timeoutMs?: number) => Promise<{ ok: boolean; stdout: string; stderr: string; exitCode: number }>
  }
  fs: {
    readDirTree: (dirPath: string) => Promise<DirTreeItem[]>
  }
  app: {
    getInfo: () => Promise<{
      version: string
      name: string
      userDataPath: string
      platform: string
      arch: string
    }>
    clearAllData: () => Promise<boolean>
    notify: (title: string, body: string) => Promise<void>
  }
}

export interface DirTreeItem {
  name: string
  path: string
  isDir: boolean
  size: number
  modified: string
  children?: DirTreeItem[]
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export {}
