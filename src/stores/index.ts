import { create } from 'zustand'
import { Model, Message, Conversation, AppConfig, Task, TaskMessage, AICapability, TokenUsageRecord, SubTask, MemoryEntry } from '../types'
import { v4 as uuidv4 } from 'uuid'

const api = () => (typeof window !== 'undefined' && window.electronAPI) ? window.electronAPI : null

async function saveModelsToDisk(models: Model[]) {
  const a = api()
  if (a) {
    await a.models.save({ models, providers: [] })
  } else {
    localStorage.setItem('manyai_models', JSON.stringify(models))
  }
}

async function saveTasksToDisk(tasks: Task[]) {
  const a = api()
  if (a) {
    await a.tasks.save(tasks)
  } else {
    localStorage.setItem('manyai_tasks', JSON.stringify(tasks))
  }
}

async function saveCapabilitiesToDisk(caps: AICapability[]) {
  const a = api()
  if (a) {
    await a.config.set('aiCapabilities', caps)
  } else {
    localStorage.setItem('manyai_caps', JSON.stringify(caps))
  }
}

async function loadModelsFromDisk(): Promise<Model[]> {
  const a = api()
  if (a) {
    const data = await a.models.getAll()
    const loaded = data?.models || []
    // 显式过滤掉旧版内置的默认模型，防止空列表时回退
    const bannedIds = new Set(['glm-4-flash', 'glm-4.6v-flash', 'glm-5'])
    return loaded.filter((m: Model) => !bannedIds.has(m.id))
  }
  const raw = localStorage.getItem('manyai_models')
  const loaded = raw ? JSON.parse(raw) : []
  const bannedIds = new Set(['glm-4-flash', 'glm-4.6v-flash', 'glm-5'])
  return loaded.filter((m: Model) => !bannedIds.has(m.id))
}

async function saveConvToDisk(conv: Conversation) {
  const a = api()
  if (a) {
    await a.conversations.save(conv.id, conv)
  } else {
    const list = JSON.parse(localStorage.getItem('manyai_convs') || '[]')
    const idx = list.findIndex((c: Conversation) => c.id === conv.id)
    if (idx >= 0) list[idx] = conv
    else list.unshift(conv)
    localStorage.setItem('manyai_convs', JSON.stringify(list))
  }
}

async function deleteConvFromDisk(id: string) {
  const a = api()
  if (a) {
    await a.conversations.delete(id)
  } else {
    const list = JSON.parse(localStorage.getItem('manyai_convs') || '[]')
    localStorage.setItem('manyai_convs', JSON.stringify(list.filter((c: Conversation) => c.id !== id)))
  }
}

async function loadConvsFromDisk(): Promise<Conversation[]> {
  const a = api()
  if (a) {
    const raw = await a.conversations.getAll()
    return Array.isArray(raw) ? raw : []
  }
  const raw = localStorage.getItem('manyai_convs')
  return raw ? JSON.parse(raw) : []
}

async function saveConfigToDisk(cfg: Record<string, any>) {
  const a = api()
  if (a) {
    await a.config.set('appConfig', cfg)
  } else {
    localStorage.setItem('manyai_config', JSON.stringify(cfg))
  }
}

async function loadConfigFromDisk(): Promise<Record<string, any>> {
  const a = api()
  if (a) {
    return (await a.config.get('appConfig')) || {}
  }
  const raw = localStorage.getItem('manyai_config')
  return raw ? JSON.parse(raw) : {}
}

async function saveTokenUsageToDisk(records: TokenUsageRecord[]) {
  const a = api()
  if (a) {
    await a.config.set('tokenUsage', records)
  } else {
    localStorage.setItem('manyai_tokenUsage', JSON.stringify(records))
  }
}

async function loadTokenUsageFromDisk(): Promise<TokenUsageRecord[]> {
  const a = api()
  if (a) {
    return (await a.config.get('tokenUsage')) || []
  }
  const raw = localStorage.getItem('manyai_tokenUsage')
  return raw ? JSON.parse(raw) : []
}

async function saveMemoryToDisk(memories: MemoryEntry[]) {
  const a = api()
  if (a) {
    await a.config.set('globalMemory', memories)
  } else {
    localStorage.setItem('manyai_memory', JSON.stringify(memories))
  }
}

async function loadMemoryFromDisk(): Promise<MemoryEntry[]> {
  const a = api()
  if (a) {
    return (await a.config.get('globalMemory')) || []
  }
  const raw = localStorage.getItem('manyai_memory')
  return raw ? JSON.parse(raw) : []
}

const defaultModels: Model[] = []

interface AppStore {
  loaded: boolean
  config: AppConfig
  models: Model[]
  currentModel: Model | null
  conversations: Conversation[]
  currentConversation: Conversation | null
  sidebarCollapsed: boolean
  showSettings: boolean
  isGenerating: boolean
  appInfo: { version: string; name: string; userDataPath: string; platform: string; arch: string } | null
  activePage: string
  tasks: Task[]
  currentTask: Task | null
  aiCapabilities: AICapability[]
  tokenUsage: TokenUsageRecord[]
  modelStatus: Record<string, { online: boolean; lastChecked: number; error?: string }>
  // 各模型上下文用量（会话内，不持久化）
  modelContextUsage: Record<string, { used: number; max: number }>
  // 长期记忆（跨任务）
  globalMemory: MemoryEntry[]

  loadAll: () => Promise<void>
  setConfig: (cfg: Partial<AppConfig>) => void
  addModel: (model: Model) => Promise<void>
  updateModel: (id: string, updates: Partial<Model>) => Promise<void>
  deleteModel: (id: string) => Promise<void>
  setCurrentModel: (m: Model | null) => void
  addConversation: (conv: Conversation) => Promise<void>
  setCurrentConversation: (conv: Conversation | null) => void
  deleteConversation: (id: string) => Promise<void>
  addMessage: (convId: string, msg: Message) => Promise<void>
  updateMessage: (convId: string, msgId: string, content: string) => Promise<void>
  setSidebarCollapsed: (v: boolean) => void
  setShowSettings: (v: boolean) => void
  setIsGenerating: (v: boolean) => void
  setActivePage: (page: string) => void
  addTask: (task: Task) => Promise<void>
  updateTask: (id: string, updates: Partial<Task>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  setCurrentTask: (task: Task | null) => void
  addTaskMessage: (taskId: string, msg: TaskMessage) => Promise<void>
  setSubtasks: (taskId: string, subtasks: SubTask[]) => Promise<void>
  toggleSubtask: (taskId: string, subtaskId: string) => Promise<void>
  updateAICapability: (modelId: string, updates: Partial<AICapability>) => void
  addTokenUsage: (record: TokenUsageRecord) => Promise<void>
  clearTokenUsage: () => Promise<void>
  checkModelStatus: (modelId: string) => Promise<void>
  setModelContextUsage: (modelId: string, used: number, max: number) => void
  // 长期记忆
  addMemory: (entry: MemoryEntry) => Promise<void>
  getRelevantMemories: (query: string, limit?: number) => MemoryEntry[]
  searchMemory: (keyword: string) => MemoryEntry[]
}

export const useAppStore = create<AppStore>((set, get) => ({
  loaded: false,
  config: { models: defaultModels, providers: [], language: 'zh', theme: 'light', sidebarCollapsed: false },
  models: defaultModels,
  currentModel: defaultModels[0],
  conversations: [],
  currentConversation: null,
  sidebarCollapsed: false,
  showSettings: false,
  isGenerating: false,
  appInfo: null,
  activePage: 'chat',
  tasks: [],
  currentTask: null,
  aiCapabilities: [],
  tokenUsage: [],
  modelStatus: {},
  modelContextUsage: {},
  globalMemory: [],

  loadAll: async () => {
    try {
      const [models, conversations, savedCfg] = await Promise.all([
        loadModelsFromDisk(),
        loadConvsFromDisk(),
        loadConfigFromDisk(),
      ])
      const finalModels = models.length > 0 ? models : []
      const appInfo = await window.electronAPI?.app.getInfo() ?? null
      const tasks = await window.electronAPI?.tasks.getAll() ?? []
      const caps = savedCfg?.aiCapabilities ?? []
      const tokenUsage = await loadTokenUsageFromDisk()
      const memories = await loadMemoryFromDisk()
      set({
        loaded: true,
        models: finalModels,
        currentModel: finalModels[0] || null,
        conversations: Array.isArray(conversations) ? conversations : [],
        config: { ...get().config, ...(savedCfg || {}) },
        sidebarCollapsed: savedCfg?.sidebarCollapsed ?? false,
        isGenerating: false,
        appInfo,
        tasks: Array.isArray(tasks) ? tasks : [],
aiCapabilities: Array.isArray(caps) ? caps : [],
      tokenUsage: Array.isArray(tokenUsage) ? tokenUsage : [],
      globalMemory: Array.isArray(memories) ? memories : [],
    })

      // 启动后为缺少能力介绍的模型自动评估（逐个后台执行，避免限流）
      const needAssess = finalModels.filter(m => !m.capability?.trim())
      if (needAssess.length > 0) {
        ;(async () => {
          try {
            const { probeCapability } = await import('../services/agentEngine')
            for (const m of needAssess) {
              try {
                const result = await probeCapability(m)
                if (result) {
                  const capDesc = result.strengths.slice(0, 5).join('、')
                  const cur = get().models.map(x => x.id === m.id ? { ...x, capability: capDesc } : x)
                  set({ models: cur })
                  await saveModelsToDisk(cur)
                  get().updateAICapability(m.id, {
                    strengths: result.strengths,
                    weaknesses: result.weaknesses,
                    rating: result.rating,
                    autoAssessed: true,
                  })
                }
              } catch {}
            }
          } catch {}
        })()
      }
    } catch (e) {
      console.error('loadAll failed:', e)
      set({ loaded: true })
    }
  },

  setConfig: (cfg) => {
    const newCfg = { ...get().config, ...cfg }
    set({ config: newCfg })
    saveConfigToDisk(newCfg)
  },

  addModel: async (model) => {
    const models = [...get().models, model]
    set({ models })
    await saveModelsToDisk(models)

    // AI 自动能力评估：未填写擅长能力时自动评估
    if (!model.capability?.trim()) {
      // 后台异步评估，不阻塞 UI
      ;(async () => {
        try {
          const { probeCapability } = await import('../services/agentEngine')
          const result = await probeCapability(model)
          if (result) {
            const capDesc = result.strengths.slice(0, 5).join('、')
            // 更新模型的 capability 字段
            const cur = get().models.map(m => m.id === model.id ? { ...m, capability: capDesc } : m)
            set({ models: cur })
            await saveModelsToDisk(cur)
            // 更新能力统计
            get().updateAICapability(model.id, {
              strengths: result.strengths,
              weaknesses: result.weaknesses,
              rating: result.rating,
              autoAssessed: true,
            })
          }
        } catch {}
      })()
    }
  },
  updateModel: async (id, updates) => {
    const models = get().models.map(m => m.id === id ? { ...m, ...updates } : m)
    set({ models })
    await saveModelsToDisk(models)
  },
  deleteModel: async (id) => {
    const models = get().models.filter(m => m.id !== id)
    set({ models, currentModel: models[0] || null })
    await saveModelsToDisk(models)
  },
  setCurrentModel: (m) => set({ currentModel: m }),

  addConversation: async (conv) => {
    const conversations = [conv, ...get().conversations]
    set({ conversations, currentConversation: conv })
    await saveConvToDisk(conv)
  },
  setCurrentConversation: (conv) => set({ currentConversation: conv }),
  deleteConversation: async (id) => {
    const conversations = get().conversations.filter(c => c.id !== id)
    set({ conversations, currentConversation: get().currentConversation?.id === id ? null : get().currentConversation })
    await deleteConvFromDisk(id)
  },

  addMessage: async (convId, msg) => {
    let targetConv: Conversation | null = null
    const conversations = get().conversations.map(c => {
      if (c.id === convId) {
        targetConv = { ...c, messages: [...c.messages, msg], updatedAt: Date.now() }
        return targetConv
      }
      return c
    })
    const current = get().currentConversation
    set({
      conversations,
      currentConversation: current?.id === convId ? targetConv : current,
    })
    if (targetConv) await saveConvToDisk(targetConv)
  },
  updateMessage: async (convId, msgId, content) => {
    let targetConv: Conversation | null = null
    const conversations = get().conversations.map(c => {
      if (c.id === convId) {
        targetConv = { ...c, messages: c.messages.map(m => m.id === msgId ? { ...m, content } : m) }
        return targetConv
      }
      return c
    })
    const current = get().currentConversation
    set({
      conversations,
      currentConversation: current?.id === convId ? targetConv : current,
    })
    if (targetConv) await saveConvToDisk(targetConv)
  },

  setSidebarCollapsed: (v) => {
    set({ sidebarCollapsed: v })
    const cfg = { ...get().config, sidebarCollapsed: v }
    set({ config: cfg })
    saveConfigToDisk(cfg)
  },
  setShowSettings: (v) => set({ showSettings: v }),
  setIsGenerating: (v) => set({ isGenerating: v }),
  setActivePage: (page) => set({ activePage: page }),

  // Task management
  addTask: async (task) => {
    const tasks = [...get().tasks, task]
    set({ tasks })
    await saveTasksToDisk(tasks)
  },
  updateTask: async (id, updates) => {
    const tasks = get().tasks.map(t => t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t)
    set({ tasks })
    if (get().currentTask?.id === id) {
      set({ currentTask: { ...get().currentTask!, ...updates } })
    }
    await saveTasksToDisk(tasks)
  },
  deleteTask: async (id) => {
    const tasks = get().tasks.filter(t => t.id !== id)
    set({ tasks })
    if (get().currentTask?.id === id) {
      set({ currentTask: null })
    }
    await saveTasksToDisk(tasks)
  },
  setCurrentTask: (task) => set({ currentTask: task }),
  addTaskMessage: async (taskId, msg) => {
    const tasks = get().tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, messages: [...t.messages, msg], updatedAt: Date.now() }
      }
      return t
    })
    set({ tasks })
    if (get().currentTask?.id === taskId) {
      set({ currentTask: { ...get().currentTask!, messages: [...get().currentTask!.messages, msg] } })
    }
    await saveTasksToDisk(tasks)
  },
  setSubtasks: async (taskId, subtasks) => {
    const tasks = get().tasks.map(t => t.id === taskId ? { ...t, subtasks, updatedAt: Date.now() } : t)
    set({ tasks })
    if (get().currentTask?.id === taskId) {
      set({ currentTask: { ...get().currentTask!, subtasks } })
    }
    await saveTasksToDisk(tasks)
  },
  toggleSubtask: async (taskId, subtaskId) => {
    const tasks = get().tasks.map(t => {
      if (t.id === taskId) {
        return { ...t, subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s), updatedAt: Date.now() }
      }
      return t
    })
    set({ tasks })
    if (get().currentTask?.id === taskId) {
      const task = tasks.find(t => t.id === taskId)
      if (task) set({ currentTask: task })
    }
    await saveTasksToDisk(tasks)
  },
  updateAICapability: (modelId, updates) => {
    const caps = get().aiCapabilities
    const existing = caps.find(c => c.modelId === modelId)
    if (existing) {
      set({ aiCapabilities: caps.map(c => c.modelId === modelId ? { ...c, ...updates } : c) })
    } else {
      set({ aiCapabilities: [...caps, { modelId, strengths: [], weaknesses: [], rating: 5, taskCount: 0, successRate: 100, failureCount: 0, autoAssessed: false, ...updates }] })
    }
    saveCapabilitiesToDisk(get().aiCapabilities)
  },

  addTokenUsage: async (record) => {
    const tokenUsage = [...get().tokenUsage, record]
    set({ tokenUsage })
    await saveTokenUsageToDisk(tokenUsage)
  },
  clearTokenUsage: async () => {
    set({ tokenUsage: [] })
    await saveTokenUsageToDisk([])
  },
  checkModelStatus: async (modelId: string) => {
    const model = get().models.find(m => m.id === modelId)
    if (!model) return

    set({ modelStatus: { ...get().modelStatus, [modelId]: { online: false, lastChecked: Date.now(), error: '检测中...' }}})

    try {
      let online = false
      if (model.provider === 'ollama') {
        // Check local Ollama
        const baseUrl = model.baseUrl || 'http://localhost:11434'
        const res = await fetch(`${baseUrl}/api/tags`, { method: 'GET', signal: AbortSignal.timeout(3000) })
        online = res.ok
      } else {
        // Check OpenAI-compatible API
        const res = await fetch(`${model.baseUrl}/models`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${model.apiKey}` },
          signal: AbortSignal.timeout(5000)
        })
        online = res.ok
      }
      set({ modelStatus: { ...get().modelStatus, [modelId]: { online, lastChecked: Date.now() }}})
    } catch (e) {
      set({ modelStatus: { ...get().modelStatus, [modelId]: { online: false, lastChecked: Date.now(), error: String(e).slice(0, 100) }}})
    }
  },
  // 更新模型上下文用量（仅内存，供侧边栏环形指示器显示）
  setModelContextUsage: (modelId: string, used: number, max: number) => {
    set({ modelContextUsage: { ...get().modelContextUsage, [modelId]: { used, max } } })
  },
  // 长期记忆：添加记忆条目
  addMemory: async (entry: MemoryEntry) => {
    const memories = [entry, ...get().globalMemory].slice(0, 200) // 最多保留 200 条
    set({ globalMemory: memories })
    await saveMemoryToDisk(memories)
  },
  // 检索相关记忆（简单关键词匹配 + 时间衰减）
  getRelevantMemories: (query: string, limit: number = 5) => {
    const memories = get().globalMemory
    if (!memories.length) return []
    const keywords = query.toLowerCase().split(/[\s,，、]+/).filter(Boolean)
    if (!keywords.length) return memories.slice(0, limit)
    const scored = memories.map(m => {
      let score = 0
      const text = `${m.summary} ${m.keywords.join(' ')} ${m.files.join(' ')}`.toLowerCase()
      for (const kw of keywords) {
        if (text.includes(kw)) score += 2
      }
      // 时间衰减：最近的记忆权重更高
      const daysOld = (Date.now() - m.timestamp) / (1000 * 60 * 60 * 24)
      score *= Math.max(0.3, 1 - daysOld / 30)
      return { entry: m, score }
    })
    return scored
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(s => s.entry)
  },
  searchMemory: (keyword: string) => {
    const kw = keyword.toLowerCase()
    return get().globalMemory.filter(m =>
      m.summary.toLowerCase().includes(kw) ||
      m.keywords.some((k: string) => k.toLowerCase().includes(kw)) ||
      m.files.some((f: string) => f.toLowerCase().includes(kw))
    )
  },
}))
