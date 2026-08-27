import React, { useEffect, useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Plus,
  Clock,
  Play,
  FolderOpen,
  FileText,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  Zap,
  Workflow,
  Settings,
  Search,
  Star,
  Download,
  Bot,
  Check,
  Trash2,
  MoreVertical,
  BarChart3,
} from 'lucide-react'
import TitleBar from './components/TitleBar'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import SettingsPanel from './components/SettingsPanel'
import CreateTaskDialog from './components/CreateTaskDialog'
import TaskSettings from './components/TaskSettings'
import TaskWorkspace from './components/TaskWorkspace'
import { useAppStore } from './stores'
import { DirTreeItem } from './types/electron'

const fontSizeMap: Record<string, string> = {
  small: '87.5%',
  medium: '100%',
  large: '112.5%',
}

// 项目页面
const ProjectsPage: React.FC = () => {
  const { tasks, setCurrentTask, setActivePage, models } = useAppStore()
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)

  const getModelName = (id: string) => models.find(m => m.id === id)?.name || id

  const openTask = (task: any) => {
    setCurrentTask(task)
    setActivePage('taskWorkspace')
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800">项目</h1>
        <p className="text-gray-500 mt-1">多人协同，打造超级团队</p>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="mt-4 px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-2"
        >
          <Plus size={16} />
          新建任务
        </button>

        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">我的任务</h2>
          {tasks.length === 0 ? (
            <div className="text-center text-gray-400 py-16">
              <FolderOpen size={48} className="mx-auto mb-3 text-gray-300" />
              <p>暂无任务，点击上方按钮创建</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => openTask(task)}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-gray-800">{task.name}</h3>
                        {task.multiAIMode && (
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-600 text-xs rounded-full flex items-center gap-1">
                            <Bot size={10} />
                            多AI合作
                          </span>
                        )}
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          task.status === 'running' ? 'bg-blue-100 text-blue-600' :
                          task.status === 'completed' ? 'bg-green-100 text-green-600' :
                          task.status === 'failed' ? 'bg-red-100 text-red-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {task.status === 'pending' ? '待执行' :
                           task.status === 'running' ? '执行中' :
                           task.status === 'completed' ? '已完成' : '失败'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <FolderOpen size={12} />
                          {task.folderPath.split('\\').pop() || task.folderPath.split('/').pop()}
                        </span>
                        {task.multiAIMode && (
                          <>
                            <span className="flex items-center gap-1">
                              <Bot size={12} />
                              主模型: {task.mainModels.map(getModelName).join(', ') || '未选择'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap size={12} />
                              附属: {task.subModels.length}个
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setEditingTask(task)
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="任务设置"
                    >
                      <Settings size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showCreateDialog && (
        <CreateTaskDialog onClose={() => setShowCreateDialog(false)} />
      )}
      {editingTask && (
        <TaskSettings task={editingTask} onClose={() => setEditingTask(null)} />
      )}
    </div>
  )
}

// 技能与连接器页面
const ExpertsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'skills' | 'connectors'>('skills')
  const [activeSource, setActiveSource] = useState<'recommended' | 'skillhub' | 'suites'>('recommended')
  const categories = ['全部', 'Pay Skill', '办公效率', '内容创作', '开发编程', '数据分析', '设计多媒体', 'AI Agent', '知识管理']
  const [activeCategory, setActiveCategory] = useState('全部')
  const [connected, setConnected] = useState<Set<string>>(new Set())

  const featuredSkills = [
    { name: '腾讯微云', desc: '管理腾讯微云网盘平台：列表、上传、下载、删除、分享', icon: '☁️', color: 'bg-blue-100' },
    { name: '腾讯问卷', desc: '腾讯问卷操作（创建、修改、逻辑设置、统计）', icon: '📋', color: 'bg-green-100' },
    { name: '鹅厂辟谣助手', desc: '面向腾讯相关传闻的辟谣辅助 Skill', icon: '🔍', color: 'bg-yellow-100' },
    { name: '腾讯会议', desc: '腾讯会议管理助手，支持预约/创建/修改/取消会议', icon: '📹', color: 'bg-blue-100' },
  ]

  const skills = [
    { name: '腾讯文档', desc: '腾讯文档（docs.qq.com）在线协同平台', icon: '📄', downloads: '492k', stars: '259' },
    { name: 'ima-skills', desc: 'ima skills：支持对笔记、知识库的读取、写入', icon: '📝', downloads: '263k', stars: '495' },
    { name: 'web-tools-guide', desc: 'MANDATORY before calling web_search', icon: '🌐', downloads: '217k', stars: '209' },
    { name: '文章去AI味工具', desc: '去除文本中的AI写作痕迹，让文字读起来更像人类写作', icon: '✍️', downloads: '166k', stars: '575' },
    { name: 'WPS Office 全家桶', desc: 'WPS/MS Office/LibreOffice的Python操作', icon: '📊', downloads: '109k', stars: '52' },
    { name: 'smart-charts', desc: '2步生成图表：上传数据 → 将CSV/Excel/JSON文件', icon: '📈', downloads: '109k', stars: '47' },
  ]

  const skillhubSkills = [
    { name: 'github-explorer', desc: '浏览 GitHub 仓库、Issue、PR 并生成摘要报告', icon: '🐙', downloads: '321k', stars: '812' },
    { name: 'pdf-master', desc: 'PDF 解析、合并、拆分、OCR 识别一站式处理', icon: '📕', downloads: '288k', stars: '640' },
    { name: 'sql-assistant', desc: '自然语言转 SQL，支持主流数据库方言', icon: '🗄️', downloads: '201k', stars: '533' },
    { name: 'seo-optimizer', desc: '网页 SEO 诊断与关键词优化建议', icon: '🔧', downloads: '154k', stars: '387' },
    { name: 'translate-pro', desc: '多语言互译，保留格式与专业术语', icon: '🌍', downloads: '142k', stars: '356' },
    { name: 'code-reviewer', desc: '代码审查：规范、漏洞、性能建议', icon: '👩‍💻', downloads: '98k', stars: '298' },
  ]

  const suites = [
    { name: '办公效率套件', desc: '文档 + 表格 + 演示 + 邮件，一站式办公自动化', icon: '💼', downloads: '88k', stars: '421' },
    { name: '新媒体运营套件', desc: '图文创作、排版、多平台分发、数据复盘', icon: '📱', downloads: '76k', stars: '389' },
    { name: '数据分析套件', desc: '数据清洗、可视化图表、分析报告自动生成', icon: '📊', downloads: '65k', stars: '342' },
    { name: '开发编程套件', desc: '代码生成、审查、测试、部署全流程辅助', icon: '⌨️', downloads: '59k', stars: '315' },
    { name: '电商运营套件', desc: '商品文案、详情页、评价分析、竞品监控', icon: '🛒', downloads: '47k', stars: '264' },
    { name: '知识管理套件', desc: '笔记收集、知识库构建、智能检索与问答', icon: '🧠', downloads: '41k', stars: '231' },
  ]

  const sourceSkills = activeSource === 'skillhub' ? skillhubSkills : activeSource === 'suites' ? suites : skills

  const connectors = [
    { id: 'wechat', name: '微信', desc: '连接微信，收发消息、机器人自动回复', icon: '💬', color: 'bg-green-100' },
    { id: 'qq', name: 'QQ', desc: '连接 QQ，消息通知与机器人互动', icon: '🐧', color: 'bg-blue-100' },
    { id: 'dingtalk', name: '钉钉', desc: '连接钉钉，群机器人推送、工作通知', icon: '📌', color: 'bg-sky-100' },
    { id: 'email', name: '邮箱', desc: '连接邮箱（SMTP/IMAP），收发与读取邮件', icon: '📧', color: 'bg-orange-100' },
    { id: 'wecom', name: '企业微信', desc: '连接企业微信，群通知与应用消息', icon: '💼', color: 'bg-indigo-100' },
    { id: 'feishu', name: '飞书', desc: '连接飞书，机器人消息与云文档', icon: '🕊️', color: 'bg-cyan-100' },
    { id: 'telegram', name: 'Telegram', desc: '连接 Telegram Bot，跨平台消息推送', icon: '📨', color: 'bg-blue-100' },
    { id: 'webhook', name: 'Webhook', desc: '自定义 Webhook，连接任意 HTTP 服务', icon: '🔗', color: 'bg-gray-100' },
  ]

  const toggleConnect = (id: string) => {
    setConnected(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-6">
          {[
            { id: 'skills' as const, label: '技能', icon: Zap },
            { id: 'connectors' as const, label: '连接器', icon: Workflow },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'text-gray-800 border-b-2 border-gray-800'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {activeTab === 'skills' && (
          <>
            {/* Featured Skills */}
            {activeSource === 'recommended' && (
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">精选技能</h2>
                <div className="grid grid-cols-4 gap-3">
                  {featuredSkills.map((skill, i) => (
                    <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-10 h-10 ${skill.color} rounded-lg flex items-center justify-center text-xl`}>{skill.icon}</span>
                        <div>
                          <div className="font-medium text-gray-800 text-sm">{skill.name}</div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 line-clamp-2">{skill.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Source Filter: 推荐 / SkillHub / 套件 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {([
                  { id: 'recommended' as const, label: '推荐' },
                  { id: 'skillhub' as const, label: 'SkillHub' },
                  { id: 'suites' as const, label: '套件' },
                ]).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSource(s.id)}
                    className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                      activeSource === s.id
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Categories */}
              {activeSource === 'recommended' && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        activeCategory === cat
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Skills Grid */}
              <div className="grid grid-cols-4 gap-3">
                {sourceSkills.map((skill, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-xl">{skill.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm truncate">{skill.name}</div>
                      </div>
                      <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Plus size={14} className="text-gray-500" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">{skill.desc}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Download size={10} />{skill.downloads}</span>
                      <span className="flex items-center gap-1"><Star size={10} />{skill.stars}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'connectors' && (
          <>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">连接器</h2>
            <p className="text-sm text-gray-500 mb-5">将 Many AI 接入你的聊天与办公工具，实现消息互通与自动化触达</p>
            <div className="grid grid-cols-4 gap-3">
              {connectors.map((c) => {
                const isConnected = connected.has(c.id)
                return (
                  <div key={c.id} className={`bg-white border rounded-xl p-4 transition-all ${
                    isConnected ? 'border-primary-300 ring-1 ring-primary-200' : 'border-gray-200 hover:shadow-md'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-10 h-10 ${c.color} rounded-lg flex items-center justify-center text-xl`}>{c.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-800 text-sm flex items-center gap-1.5">
                          {c.name}
                          {isConnected && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="已连接" />
                          )}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3 min-h-[32px]">{c.desc}</p>
                    <button
                      onClick={() => toggleConnect(c.id)}
                      className={`w-full py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        isConnected
                          ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                    >
                      {isConnected ? (
                        <><Check size={12} />已连接（点击断开）</>
                      ) : (
                        <><Plus size={12} />连接</>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// 自动化页面
const AutomationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'logs'>('tasks')

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Tabs */}
      <div className="border-b border-gray-200 px-6 pt-4">
        <div className="flex gap-6">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`pb-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'tasks'
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Clock size={14} />
            定时任务
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`pb-3 text-sm font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'logs'
                ? 'text-gray-800 border-b-2 border-gray-800'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Play size={14} />
            运行记录
          </button>
        </div>
      </div>

      <div className="p-6 flex-1 flex items-center justify-center">
        {activeTab === 'tasks' ? (
          <div className="text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock size={32} className="text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">开启你的第一个自动化任务吧</p>
            <button className="px-5 py-2.5 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors flex items-center gap-2 mx-auto">
              <Plus size={16} />
              添加自动化
            </button>
          </div>
        ) : (
          <div className="text-center text-gray-400">
            <Play size={48} className="mx-auto mb-3 text-gray-300" />
            <p>暂无运行记录</p>
          </div>
        )}
      </div>
    </div>
  )
}

// 资料库页面
const ResourcesPage: React.FC = () => {
  const [dirTree, setDirTree] = useState<any[]>([])
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set())

  const loadDirTree = async () => {
    if (window.electronAPI) {
      const info = await window.electronAPI.app.getInfo()
      const tree = await window.electronAPI.fs.readDirTree(info.userDataPath)
      setDirTree(tree)
      const convDir = tree.find((item: any) => item.name === 'conversations')
      if (convDir) {
        setExpandedDirs(new Set([convDir.path]))
      }
    }
  }

  useEffect(() => {
    loadDirTree()
  }, [])

  const toggleDir = (dirPath: string) => {
    setExpandedDirs(prev => {
      const next = new Set(prev)
      if (next.has(dirPath)) next.delete(dirPath)
      else next.add(dirPath)
      return next
    })
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const TreeNode: React.FC<{ item: any; level?: number }> = ({ item, level = 0 }) => {
    const isExpanded = expandedDirs.has(item.path)
    return (
      <div>
        <div
          className="flex items-center gap-2 py-2 px-3 hover:bg-gray-100 rounded cursor-pointer group"
          style={{ paddingLeft: `${level * 16 + 12}px` }}
          onClick={() => {
            if (item.isDir) toggleDir(item.path)
            else window.electronAPI?.shell.showItemInFolder(item.path)
          }}
        >
          {item.isDir ? (
            <ChevronRight size={14} className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          ) : (
            <span className="w-[14px]" />
          )}
          <FileText size={14} className={item.isDir ? 'text-blue-500' : 'text-gray-500'} />
          <span className="text-sm text-gray-700 flex-1 truncate">{item.name}</span>
          {!item.isDir && <span className="text-xs text-gray-400">{formatSize(item.size)}</span>}
        </div>
        {item.isDir && isExpanded && item.children?.map((child: any) => (
          <TreeNode key={child.path} item={child} level={level + 1} />
        ))}
      </div>
    )
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">资料库</h1>
            <p className="text-gray-500 mt-1">工作空间内的所有文件和数据</p>
          </div>
          <button
            onClick={loadDirTree}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            刷新
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {dirTree.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">加载中...</div>
          ) : (
            dirTree.map((item: any) => (
              <TreeNode key={item.path} item={item} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// AI介绍页面
const AIIntroPage: React.FC = () => {
  const { models, aiCapabilities, updateModel } = useAppStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  const getCapabilityDesc = (modelId: string): string => {
    const model = models.find(m => m.id === modelId)
    const cap = aiCapabilities.find(c => c.modelId === modelId)
    if (model?.capability) return model.capability
    if (cap?.strengths?.length) return cap.strengths.join('、')
    return ''
  }

  const getStrengths = (modelId: string): string[] => {
    const cap = aiCapabilities.find(c => c.modelId === modelId)
    return cap?.strengths || []
  }

  const getWeaknesses = (modelId: string): string[] => {
    const cap = aiCapabilities.find(c => c.modelId === modelId)
    return cap?.weaknesses || []
  }

  const getRating = (modelId: string): number => {
    const cap = aiCapabilities.find(c => c.modelId === modelId)
    return cap?.rating || 0
  }

  const handleSave = async (modelId: string) => {
    await updateModel(modelId, { capability: editValue })
    setEditingId(null)
  }

  const enabledModels = models.filter(m => m.enabled)

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">AI 介绍</h1>
          <p className="text-gray-500 mt-1">查看所有已添加 AI 的能力介绍，可手动编辑</p>
        </div>

        {enabledModels.length === 0 ? (
          <div className="text-center py-16">
            <Bot size={48} className="mx-auto mb-3 text-gray-300" />
            <p className="text-gray-500">暂无已添加的 AI 模型</p>
            <p className="text-xs text-gray-400 mt-1">请先在设置中添加模型</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enabledModels.map((model) => {
              const strengthList = getStrengths(model.id)
              const weaknessList = getWeaknesses(model.id)
              const rating = getRating(model.id)
              const isEditing = editingId === model.id

              return (
                <div key={model.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-primary-400 to-primary-600">
                      {model.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-800">{model.name}</h3>
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{model.provider}</span>
                        {rating > 0 && (
                          <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            {'★'.repeat(Math.min(5, Math.round(rating / 2)))} {rating}/10
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">ID: {model.id}</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingId(isEditing ? null : model.id)
                        setEditValue(model.capability || '')
                      }}
                      className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                        isEditing ? 'bg-gray-200 text-gray-600' : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {isEditing ? '取消' : '编辑'}
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-4">
                    {isEditing ? (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">能力介绍</label>
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          placeholder="如：擅长代码编写、数据分析、文案创作..."
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => handleSave(model.id)}
                            className="px-4 py-2 bg-primary-500 text-white text-sm rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            保存
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* Capability description */}
                        <div className="mb-4">
                          <div className="text-xs font-medium text-gray-500 mb-1">擅长能力</div>
                          {getCapabilityDesc(model.id) ? (
                            <p className="text-sm text-gray-700">{getCapabilityDesc(model.id)}</p>
                          ) : (
                            <p className="text-sm text-gray-400 italic">未设置能力介绍（添加模型时可自动评估或手动填写）</p>
                          )}
                        </div>

                        {/* Strengths */}
                        {strengthList.length > 0 && (
                          <div className="mb-3">
                            <div className="text-xs font-medium text-gray-500 mb-1">擅长领域</div>
                            <div className="flex flex-wrap gap-1.5">
                              {strengthList.map((s, i) => (
                                <span key={i} className="px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-lg">{s}</span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Weaknesses */}
                        {weaknessList.length > 0 && (
                          <div>
                            <div className="text-xs font-medium text-gray-500 mb-1">不擅长领域</div>
                            <div className="flex flex-wrap gap-1.5">
                              {weaknessList.map((w, i) => (
                                <span key={i} className="px-2.5 py-1 bg-red-50 text-red-600 text-xs rounded-lg">{w}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// Token用量页面
const TokenUsagePage: React.FC = () => {
  const { tokenUsage, clearTokenUsage, models } = useAppStore()
  const [view, setView] = useState<'chart' | 'table'>('chart')

  const totalInput = tokenUsage.reduce((s, r) => s + r.inputTokens, 0)
  const totalOutput = tokenUsage.reduce((s, r) => s + r.outputTokens, 0)
  const totalAll = tokenUsage.reduce((s, r) => s + r.totalTokens, 0)

  const byModel: Record<string, { input: number; output: number; total: number; count: number }> = {}
  for (const r of tokenUsage) {
    const key = r.modelName || r.modelId
    if (!byModel[key]) byModel[key] = { input: 0, output: 0, total: 0, count: 0 }
    byModel[key].input += r.inputTokens
    byModel[key].output += r.outputTokens
    byModel[key].total += r.totalTokens
    byModel[key].count++
  }

  const formatTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  }

  const formatFullTime = (ts: number) => {
    const d = new Date(ts)
    return d.toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // Chart data: group by minute for cleaner display
  const chartData = useMemo(() => {
    if (tokenUsage.length === 0) return []
    const sorted = [...tokenUsage].sort((a, b) => a.timestamp - b.timestamp)
    const groups: { time: number; total: number; input: number; output: number; label: string }[] = []
    let lastLabel = ''
    let current = { time: 0, total: 0, input: 0, output: 0, label: '' }
    for (const r of sorted) {
      const d = new Date(r.timestamp)
      const label = `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
      if (label !== lastLabel) {
        if (current.time > 0) groups.push(current)
        current = { time: r.timestamp, total: r.totalTokens, input: r.inputTokens, output: r.outputTokens, label }
        lastLabel = label
      } else {
        current.total += r.totalTokens
        current.input += r.inputTokens
        current.output += r.outputTokens
      }
    }
    if (current.time > 0) groups.push(current)
    return groups
  }, [tokenUsage])

  // SVG chart dimensions
  const CHART_W = 700
  const CHART_H = 220
  const PAD = { top: 20, right: 20, bottom: 40, left: 60 }
  const innerW = CHART_W - PAD.left - PAD.right
  const innerH = CHART_H - PAD.top - PAD.bottom

  const maxVal = chartData.length > 0 ? Math.max(...chartData.map(d => d.total), 1) : 1
  const yTicks = 5

  const toX = (i: number) => chartData.length <= 1 ? innerW / 2 : (i / (chartData.length - 1)) * innerW
  const toY = (v: number) => innerH - (v / maxVal) * innerH

  const buildPath = (values: number[]) => {
    if (values.length === 0) return ''
    return values.map((v, i) => `${i === 0 ? 'M' : 'L'}${toX(i).toFixed(1)},${toY(v).toFixed(1)}`).join(' ')
  }

  const totalPath = buildPath(chartData.map(d => d.total))
  const inputPath = buildPath(chartData.map(d => d.input))
  const outputPath = buildPath(chartData.map(d => d.output))

  // Color map for models
  const modelColors = ['rgb(59,130,246)', 'rgb(16,185,129)', 'rgb(245,158,11)', 'rgb(239,68,68)', 'rgb(139,92,246)', 'rgb(236,72,153)']

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Token 用量</h1>
            <p className="text-gray-500 mt-1">实时记录每次 API 调用的 Token 消耗</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setView('chart')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'chart' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart3 size={14} className="inline mr-1" />
                折线图
              </button>
              <button
                onClick={() => setView('table')}
                className={`px-3 py-1.5 text-xs rounded-md transition-colors ${view === 'table' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <FileText size={14} className="inline mr-1" />
                列表
              </button>
            </div>
            {tokenUsage.length > 0 && (
              <button
                onClick={() => { if (window.confirm('确定要清空所有 Token 用量记录吗？')) clearTokenUsage() }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
                清空记录
              </button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">总消耗</div>
            <div className="text-2xl font-bold text-gray-800">{totalAll.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">tokens</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">输入</div>
            <div className="text-2xl font-bold text-blue-600">{totalInput.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">prompt tokens</div>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="text-sm text-gray-500 mb-1">输出</div>
            <div className="text-2xl font-bold text-green-600">{totalOutput.toLocaleString()}</div>
            <div className="text-xs text-gray-400 mt-1">completion tokens</div>
          </div>
        </div>

        {/* Chart / Table view */}
        {view === 'chart' ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Token 消耗趋势</h2>
            {chartData.length === 0 ? (
              <div className="text-center py-16">
                <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
                <p className="text-gray-500">暂无 Token 用量记录</p>
                <p className="text-xs text-gray-400 mt-1">发送消息后将自动记录</p>
              </div>
            ) : (
              <div>
                <svg viewBox={`0 0 ${CHART_W} ${CHART_H}`} className="w-full" style={{ maxHeight: 280 }}>
                  {/* Grid lines */}
                  {Array.from({ length: yTicks + 1 }, (_, i) => {
                    const y = PAD.top + (i / yTicks) * innerH
                    const val = Math.round(maxVal * (1 - i / yTicks))
                    return (
                      <g key={i}>
                        <line x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#f0f0f0" strokeWidth={1} />
                        <text x={PAD.left - 8} y={y + 4} textAnchor="end" fontSize={10} fill="#999">
                          {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                        </text>
                      </g>
                    )
                  })}

                  {/* X axis labels */}
                  {chartData.map((d, i) => {
                    const show = chartData.length <= 10 || i % Math.ceil(chartData.length / 8) === 0 || i === chartData.length - 1
                    if (!show) return null
                    return (
                      <text key={i} x={PAD.left + toX(i)} y={CHART_H - 8} textAnchor="middle" fontSize={9} fill="#999">
                        {d.label}
                      </text>
                    )
                  })}

                  {/* Lines */}
                  <g transform={`translate(${PAD.left},${PAD.top})`}>
                    {totalPath && <path d={totalPath} fill="none" stroke="rgb(59,130,246)" strokeWidth={2} strokeLinejoin="round" />}
                    {inputPath && <path d={inputPath} fill="none" stroke="rgb(16,185,129)" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4,3" />}
                    {outputPath && <path d={outputPath} fill="none" stroke="rgb(245,158,11)" strokeWidth={1.5} strokeLinejoin="round" strokeDasharray="4,3" />}

                    {/* Dots on total line */}
                    {chartData.map((d, i) => (
                      <circle key={i} cx={toX(i)} cy={toY(d.total)} r={3} fill="rgb(59,130,246)" />
                    ))}
                  </g>
                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-blue-500 rounded" />总计</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-green-500 rounded border-dashed" style={{ borderTop: '1.5px dashed rgb(16,185,129)', height: 0 }} />输入</div>
                  <div className="flex items-center gap-1.5"><div className="w-4 h-0.5 bg-amber-500 rounded border-dashed" style={{ borderTop: '1.5px dashed rgb(245,158,11)', height: 0 }} />输出</div>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Per-model breakdown */}
        {Object.keys(byModel).length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">按模型统计</h2>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">模型</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">调用次数</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">输入 Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">输出 Tokens</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">总 Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(byModel).sort((a, b) => b[1].total - a[1].total).map(([name, stats]) => (
                    <tr key={name} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">{name}</td>
                      <td className="px-4 py-3 text-right text-gray-600">{stats.count}</td>
                      <td className="px-4 py-3 text-right text-blue-600">{stats.input.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-green-600">{stats.output.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{stats.total.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Recent records - simplified table matching screenshot */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">最近记录</h2>
          {tokenUsage.length === 0 ? (
            <div className="text-center py-16">
              <BarChart3 size={48} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">暂无 Token 用量记录</p>
              <p className="text-xs text-gray-400 mt-1">发送消息后将自动记录每次 API 调用的 Token 消耗</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">时间</th>
                    <th className="px-6 py-3 text-right font-medium text-gray-600">Token 消耗</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-600">模型</th>
                  </tr>
                </thead>
                <tbody>
                  {[...tokenUsage].reverse().slice(0, 100).map((record) => (
                    <tr key={record.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <td className="px-6 py-3 text-gray-500">{formatFullTime(record.timestamp)}</td>
                      <td className="px-6 py-3 text-right font-medium text-gray-800">{record.totalTokens.toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-800">{record.modelName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// 更多页面
const MorePage: React.FC = () => {
  const { setActivePage } = useAppStore()

  const items = [
    { icon: Bot, title: 'AI 介绍', desc: '查看所有已添加 AI 的能力介绍', color: 'text-primary-500', bgColor: 'bg-primary-50', page: 'aiIntro' },
    { icon: BarChart3, title: 'Token 用量', desc: '查看 API Token 消耗统计', color: 'text-blue-500', bgColor: 'bg-blue-50', page: 'tokenUsage' },
    { icon: Zap, title: '深度研究', desc: '深度搜索与分析', color: 'text-cyan-500', bgColor: 'bg-cyan-50', page: null },
    { icon: FileText, title: '文档处理', desc: '智能文档分析与总结', color: 'text-blue-500', bgColor: 'bg-blue-50', page: null },
    { icon: BarChart3, title: '数据分析', desc: '数据可视化与分析', color: 'text-green-500', bgColor: 'bg-green-50', page: null },
    { icon: Settings, title: '开发者工具', desc: '代码辅助与调试', color: 'text-orange-500', bgColor: 'bg-orange-50', page: null },
    { icon: Search, title: '网页浏览', desc: '网络内容获取', color: 'text-purple-500', bgColor: 'bg-purple-50', page: null },
  ]

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">更多</h1>
        <div className="grid grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div
              key={i}
              onClick={() => item.page && setActivePage(item.page)}
              className={`bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow cursor-pointer`}
            >
              <div className={`w-12 h-12 ${item.bgColor} rounded-xl flex items-center justify-center mb-3`}>
                <item.icon size={24} className={item.color} />
              </div>
              <h3 className="font-medium text-gray-800">{item.title}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function App() {
  const { i18n } = useTranslation()
  const { loaded, loadAll, config, showSettings, activePage } = useAppStore()

  useEffect(() => {
    loadAll().then(() => {
      const savedLang = useAppStore.getState().config.language
      if (savedLang) i18n.changeLanguage(savedLang)
    })
  }, [])

  useEffect(() => {
    const size = (config as any).fontSize ?? 'medium'
    document.documentElement.style.fontSize = fontSizeMap[size] || '100%'
  }, [(config as any).fontSize])

  useEffect(() => {
    if (!loaded) return
    const cfg = useAppStore.getState().config as any
    const shortcuts: Record<string, string> = {
      shortcutNewChat: cfg.shortcutNewChat ?? 'Ctrl+N',
      shortcutOpenSettings: cfg.shortcutOpenSettings ?? 'Ctrl+,',
      shortcutToggleSidebar: cfg.shortcutToggleSidebar ?? 'Ctrl+B',
    }
    const comboMap: Record<string, string> = {}
    for (const [action, combo] of Object.entries(shortcuts)) {
      comboMap[combo.toLowerCase()] = action
    }

    const onKey = (e: KeyboardEvent) => {
      const parts: string[] = []
      if (e.ctrlKey || e.metaKey) parts.push('ctrl')
      if (e.altKey) parts.push('alt')
      if (e.shiftKey) parts.push('shift')
      parts.push(e.key === ',' ? ',' : e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase())
      const combo = parts.join('+')
      const action = comboMap[combo]
      if (!action) return

      e.preventDefault()
      const store = useAppStore.getState()
      if (action === 'shortcutNewChat') {
        store.setCurrentConversation(null)
        store.setActivePage('chat')
      } else if (action === 'shortcutOpenSettings') {
        store.setShowSettings(!store.showSettings)
      } else if (action === 'shortcutToggleSidebar') {
        store.setSidebarCollapsed(!store.config.sidebarCollapsed)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [loaded, showSettings, config.sidebarCollapsed, config.shortcutNewChat, config.shortcutOpenSettings, config.shortcutToggleSidebar])

  if (!loaded) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <span className="text-white text-xl font-bold">M</span>
          </div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  const renderPage = () => {
    switch (activePage) {
      case 'projects': return <ProjectsPage />
      case 'experts': return <ExpertsPage />
      case 'automation': return <AutomationPage />
      case 'resources': return <ResourcesPage />
      case 'more': return <MorePage />
      case 'tokenUsage': return <TokenUsagePage />
      case 'aiIntro': return <AIIntroPage />
      case 'taskWorkspace': return <TaskWorkspace onBack={() => useAppStore.getState().setActivePage('projects')} />
      default: return <ChatArea />
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 overflow-hidden">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          collapsed={config.sidebarCollapsed}
          onToggle={() => {
            const store = useAppStore.getState()
            store.setSidebarCollapsed(!store.config.sidebarCollapsed)
          }}
          onSettings={() => useAppStore.getState().setShowSettings(true)}
        />
        {renderPage()}
      </div>
      {showSettings && (
        <SettingsPanel
          onClose={() => useAppStore.getState().setShowSettings(false)}
        />
      )}
    </div>
  )
}

export default App
