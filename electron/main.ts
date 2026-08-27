import { app, BrowserWindow, ipcMain, Tray, Menu, shell, dialog, Notification } from 'electron'
import path from 'path'
import fs from 'fs'

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  let mainWindow: BrowserWindow | null = null

  const userDataPath = app.getPath('userData')
  const MODELS_FILE = path.join(userDataPath, 'models.json')
  const CONFIG_FILE = path.join(userDataPath, 'config.json')
  const CONVERSATIONS_DIR = path.join(userDataPath, 'conversations')
  const TASKS_FILE = path.join(userDataPath, 'tasks.json')

  function ensureDir(dir: string) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }

  function readJSON(filePath: string, fallback: any = null) {
    try {
      if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    } catch (e) { console.error('readJSON error:', filePath, e) }
    return fallback
  }

  function writeJSON(filePath: string, data: any) {
    try {
      ensureDir(path.dirname(filePath))
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
      return true
    } catch (e) { console.error('writeJSON error:', filePath, e); return false }
  }

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 700,
      title: 'Many AI',
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false,
      },
      titleBarStyle: 'hidden',
      titleBarOverlay: false,
      backgroundColor: '#ffffff',
      show: false,
    })

    const isInAsar = __dirname.includes('.asar')
    const indexPath = isInAsar
      ? path.join(__dirname, 'dist/index.html')
      : path.join(__dirname, '../dist/index.html')
    mainWindow.loadFile(indexPath)
    mainWindow.once('ready-to-show', () => mainWindow?.show())
    mainWindow.on('closed', () => { mainWindow = null })
  }

  function setupIPC() {
    ipcMain.handle('window:minimize', () => mainWindow?.minimize())
    ipcMain.handle('window:maximize', () => {
      if (mainWindow?.isMaximized()) mainWindow.unmaximize()
      else mainWindow?.maximize()
    })
    ipcMain.handle('window:close', () => mainWindow?.close())
    ipcMain.handle('window:isMaximized', () => mainWindow?.isMaximized() ?? false)

    ipcMain.handle('models:getAll', () => readJSON(MODELS_FILE, { models: [], providers: [] }))
    ipcMain.handle('models:save', (_, data) => writeJSON(MODELS_FILE, data))

    ipcMain.handle('config:get', (_, key) => {
      const cfg = readJSON(CONFIG_FILE, {})
      return key ? cfg[key] : cfg
    })
    ipcMain.handle('config:set', (_, key, value) => {
      const cfg = readJSON(CONFIG_FILE, {})
      cfg[key] = value
      return writeJSON(CONFIG_FILE, cfg)
    })

    ipcMain.handle('conversations:getAll', () => {
      ensureDir(CONVERSATIONS_DIR)
      try {
        return fs.readdirSync(CONVERSATIONS_DIR)
          .filter(f => f.endsWith('.json'))
          .map(f => readJSON(path.join(CONVERSATIONS_DIR, f)))
          .filter(Boolean)
          .sort((a: any, b: any) => (b.updatedAt || 0) - (a.updatedAt || 0))
      } catch { return [] }
    })
    ipcMain.handle('conversations:get', (_, id) => readJSON(path.join(CONVERSATIONS_DIR, `${id}.json`)))
    ipcMain.handle('conversations:save', (_, id, data) => {
      ensureDir(CONVERSATIONS_DIR)
      return writeJSON(path.join(CONVERSATIONS_DIR, `${id}.json`), data)
    })
    ipcMain.handle('conversations:delete', (_, id) => {
      const fp = path.join(CONVERSATIONS_DIR, `${id}.json`)
      if (fs.existsSync(fp)) { fs.unlinkSync(fp); return true }
      return false
    })

    // 数据管理 - 读取目录树
    ipcMain.handle('fs:readDirTree', (_, dirPath: string) => {
      function readTree(dir: string, depth: number = 0): any[] {
        if (depth > 5) return [] // 限制深度
        try {
          const items = fs.readdirSync(dir)
          return items
            .filter(item => !item.startsWith('.') && item !== 'node_modules')
            .map(item => {
              const fullPath = path.join(dir, item)
              try {
                const stat = fs.statSync(fullPath)
                const isDir = stat.isDirectory()
                return {
                  name: item,
                  path: fullPath,
                  isDir,
                  size: stat.size,
                  modified: stat.mtime,
                  children: isDir ? readTree(fullPath, depth + 1) : undefined,
                }
              } catch {
                return null
              }
            })
            .filter(Boolean)
            .sort((a: any, b: any) => {
              if (a.isDir !== b.isDir) return a.isDir ? -1 : 1
              return a.name.localeCompare(b.name)
            })
        } catch {
          return []
        }
      }
      return readTree(dirPath)
    })

    ipcMain.handle('shell:openExternal', (_, url) => shell.openExternal(url))
    ipcMain.handle('shell:showItemInFolder', (_, fullPath: string) => shell.showItemInFolder(fullPath))
    ipcMain.handle('shell:openPath', (_, fullPath: string) => shell.openPath(fullPath))

    ipcMain.handle('dialog:selectFolder', async () => {
      if (!mainWindow) return null
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openDirectory', 'createDirectory'],
        title: '选择工作文件夹',
      })
      if (result.canceled || result.filePaths.length === 0) return null
      return result.filePaths[0]
    })

    ipcMain.handle('dialog:selectFiles', async () => {
      if (!mainWindow) return []
      const result = await dialog.showOpenDialog(mainWindow, {
        properties: ['openFile', 'multiSelections'],
        title: '添加文件',
      })
      if (result.canceled || result.filePaths.length === 0) return []
      return result.filePaths
    })

    ipcMain.handle('dialog:readFileContent', (_, filePath: string) => {
      try {
        const stat = fs.statSync(filePath)
        if (stat.size > 1024 * 1024) return { ok: false, error: '文件过大 (>1MB)' }
        const ext = path.extname(filePath).toLowerCase()
        const textExts = ['.txt', '.md', '.json', '.js', '.ts', '.tsx', '.jsx', '.py', '.html', '.css', '.csv', '.log', '.yml', '.yaml', '.xml', '.sh', '.bat', '.sql', '.java', '.c', '.cpp', '.h', '.go', '.rs', '.rb', '.php', '.ini', '.toml']
        if (!textExts.includes(ext) && ext !== '') {
          return { ok: false, error: `不支持的文件类型: ${ext || '未知'}（仅支持文本类文件）` }
        }
        return { ok: true, content: fs.readFileSync(filePath, 'utf-8') }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    ipcMain.handle('tasks:getAll', () => readJSON(TASKS_FILE, []))
    ipcMain.handle('tasks:save', (_, data) => writeJSON(TASKS_FILE, data))

    // ---------- Agent 工具：文件操作（限制在授权的工作文件夹内） ----------
    // 安全校验：路径必须位于允许的根目录内
    function assertInsideRoot(root: string, target: string) {
      const resolvedRoot = path.resolve(root)
      const resolvedTarget = path.resolve(target)
      if (!resolvedTarget.startsWith(resolvedRoot)) {
        throw new Error(`路径越界: ${resolvedTarget} 不在 ${resolvedRoot} 内`)
      }
      return resolvedTarget
    }

    ipcMain.handle('agent:readFile', (_, root: string, relPath: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        if (!fs.existsSync(fp)) return { ok: false, error: '文件不存在' }
        const stat = fs.statSync(fp)
        if (stat.size > 512 * 1024) return { ok: false, error: '文件过大 (>512KB)' }
        return { ok: true, content: fs.readFileSync(fp, 'utf-8') }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    ipcMain.handle('agent:writeFile', (_, root: string, relPath: string, content: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        ensureDir(path.dirname(fp))
        fs.writeFileSync(fp, content, 'utf-8')
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 精准编辑：str_replace 风格（Claude Code 模式），替换文件中的精确文本
    ipcMain.handle('agent:editFile', (_, root: string, relPath: string, oldStr: string, newStr: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        if (!fs.existsSync(fp)) return { ok: false, error: '文件不存在' }
        const content = fs.readFileSync(fp, 'utf-8')
        const count = content.split(oldStr).length - 1
        if (count === 0) return { ok: false, error: '未找到要替换的文本（old_str 必须与文件内容精确匹配，包括空格和缩进）' }
        if (count > 1) return { ok: false, error: `old_str 在文件中出现 ${count} 次，请提供更多上下文使其唯一（如包含前后几行）` }
        const updated = content.replace(oldStr, newStr)
        fs.writeFileSync(fp, updated, 'utf-8')
        return { ok: true, replaced: count }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 追加内容到文件末尾
    ipcMain.handle('agent:appendFile', (_, root: string, relPath: string, content: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        ensureDir(path.dirname(fp))
        fs.appendFileSync(fp, content, 'utf-8')
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 删除文件
    ipcMain.handle('agent:deleteFile', (_, root: string, relPath: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        if (!fs.existsSync(fp)) return { ok: false, error: '文件不存在' }
        const stat = fs.statSync(fp)
        if (stat.isDirectory()) {
          fs.rmdirSync(fp, { recursive: true })
        } else {
          fs.unlinkSync(fp)
        }
        return { ok: true }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 内容搜索：grep 风格，在目录内搜索文本（返回匹配行及行号）
    ipcMain.handle('agent:searchFiles', (_, root: string, relPath: string, pattern: string, isRegex: boolean = false) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        if (!fs.existsSync(fp)) return { ok: false, error: '目录不存在' }
        let regex: RegExp
        try {
          regex = new RegExp(isRegex ? pattern : pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
        } catch {
          return { ok: false, error: '无效的正则表达式' }
        }
        const results: Array<{ file: string; line: number; text: string }> = []
        const MAX_RESULTS = 100
        // helper to check size (avoid huge/binary files)
        const sizeOk = (p: string) => { try { return fs.statSync(p).size < 512 * 1024 } catch { return false } }

        function searchDir(dir: string, depth: number) {
          if (depth > 6 || results.length >= MAX_RESULTS) return
          let entries
          try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
          for (const entry of entries) {
            if (results.length >= MAX_RESULTS) return
            const full = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) searchDir(full, depth + 1)
            } else if (entry.isFile() && sizeOk(full)) {
              try {
                const content = fs.readFileSync(full, 'utf-8')
                const lines = content.split('\n')
                for (let i = 0; i < lines.length && results.length < MAX_RESULTS; i++) {
                  regex.lastIndex = 0
                  if (regex.test(lines[i])) {
                    results.push({ file: path.relative(fp, full).replace(/\\/g, '/'), line: i + 1, text: lines[i].trim().slice(0, 300) })
                  }
                }
              } catch {}
            }
          }
        }

        if (fs.statSync(fp).isFile()) {
          // 单文件搜索
          const content = fs.readFileSync(fp, 'utf-8')
          const lines = content.split('\n')
          for (let i = 0; i < lines.length && results.length < MAX_RESULTS; i++) {
            regex.lastIndex = 0
            if (regex.test(lines[i])) {
              results.push({ file: path.basename(fp), line: i + 1, text: lines[i].trim().slice(0, 300) })
            }
          }
        } else {
          searchDir(fp, 0)
        }
        return { ok: true, matches: results, truncated: results.length >= MAX_RESULTS }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 文件查找：glob 风格模式匹配（如 *.js, src/**/*.ts, **/*.py）
    ipcMain.handle('agent:findFiles', (_, root: string, pattern: string) => {
      try {
        const fp = assertInsideRoot(root, path.join(root, ''))
        const results: string[] = []
        const MAX_RESULTS = 200

        // 将 glob 模式转换为正则
        function globToRegex(glob: string): RegExp {
          let re = ''
          let i = 0
          while (i < glob.length) {
            const c = glob[i]
            if (c === '*') {
              if (glob[i + 1] === '*') {
                // ** 匹配任意层级
                if (glob[i + 2] === '/') { re += '(?:.*/)?'; i += 3 } 
                else { re += '.*'; i += 2 }
              } else { re += '[^/]*'; i += 1 }
            } else if (c === '?') { re += '[^/]'; i += 1 }
            else if (c === '{') {
              let j = glob.indexOf('}', i)
              re += '(' + glob.slice(i + 1, j).split(',').join('|') + ')'
              i = j + 1
            }
            else { re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&'); i += 1 }
          }
          return new RegExp('^' + re + '$', 'i')
        }

        const regex = globToRegex(pattern)
        function walk(dir: string, depth: number) {
          if (depth > 8 || results.length >= MAX_RESULTS) return
          let entries
          try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
          for (const entry of entries) {
            if (results.length >= MAX_RESULTS) return
            const full = path.join(dir, entry.name)
            const rel = path.relative(fp, full).replace(/\\/g, '/')
            if (entry.isDirectory()) {
              if (entry.name !== 'node_modules' && !entry.name.startsWith('.')) {
                if (regex.test(rel)) results.push(rel + '/')
                walk(full, depth + 1)
              }
            } else {
              if (regex.test(rel)) results.push(rel)
            }
          }
        }
        walk(fp, 0)
        return { ok: true, files: results.slice(0, MAX_RESULTS), truncated: results.length >= MAX_RESULTS }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    ipcMain.handle('agent:listFiles', (_, root: string, relPath: string = '') => {
      try {
        const fp = assertInsideRoot(root, path.join(root, relPath))
        if (!fs.existsSync(fp)) return { ok: false, error: '目录不存在' }
        const items = fs.readdirSync(fp).map(name => {
          const s = fs.statSync(path.join(fp, name))
          return { name, isDir: s.isDirectory(), size: s.size }
        })
        return { ok: true, items }
      } catch (e: any) {
        return { ok: false, error: e.message }
      }
    })

    // 命令执行（需安全中心放行，超时保护）
    ipcMain.handle('agent:execCommand', async (_, root: string, command: string, timeoutMs: number = 30000) => {
      const { exec } = require('child_process') as typeof import('child_process')
      return new Promise((resolve) => {
        try {
          const child = exec(command, { cwd: root, timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 },
            (error, stdout, stderr) => {
              resolve({
                ok: !error || !!stdout,
                stdout: (stdout || '').slice(0, 50 * 1024),
                stderr: (stderr || '').slice(0, 10 * 1024),
                exitCode: error?.code ?? 0,
              })
            })
        } catch (e: any) {
          resolve({ ok: false, stdout: '', stderr: e.message, exitCode: -1 })
        }
      })
    })

    ipcMain.handle('app:getInfo', () => ({
      version: app.getVersion(),
      name: app.getName(),
      userDataPath,
      platform: process.platform,
      arch: process.arch,
    }))

    // 任务完成通知（Windows toast + 系统提示音）
    ipcMain.handle('app:notify', (_, title: string, body: string) => {
      // 播放系统提示音
      try {
        const { exec } = require('child_process')
        exec('powershell -c "[System.Media.SystemSounds]::Asterisk.Play()"', { windowsHide: true })
      } catch {}

      // 发送 Windows 通知
      if (Notification.isSupported()) {
        const notification = new Notification({
          title,
          body,
          silent: false,
        })
        notification.show()
      }
    })
    ipcMain.handle('app:clearAllData', () => {
      try {
        if (fs.existsSync(MODELS_FILE)) fs.unlinkSync(MODELS_FILE)
        if (fs.existsSync(CONFIG_FILE)) fs.unlinkSync(CONFIG_FILE)
        if (fs.existsSync(CONVERSATIONS_DIR)) {
          for (const f of fs.readdirSync(CONVERSATIONS_DIR)) {
            if (f.endsWith('.json')) fs.unlinkSync(path.join(CONVERSATIONS_DIR, f))
          }
        }
        return true
      } catch (e) { console.error('clearAllData error:', e); return false }
    })
  }

  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    ensureDir(CONVERSATIONS_DIR)
    setupIPC()
    createWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
