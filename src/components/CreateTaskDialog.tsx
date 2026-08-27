import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  FolderOpen,
  ChevronRight,
  ChevronLeft,
  Check,
  Bot,
  Zap,
  Settings,
} from 'lucide-react'
import { useAppStore } from '../stores'
import { Task, Model } from '../types'
import { v4 as uuidv4 } from 'uuid'

interface CreateTaskDialogProps {
  onClose: () => void
}

const CreateTaskDialog: React.FC<CreateTaskDialogProps> = ({ onClose }) => {
  const { t } = useTranslation()
  const { models, addTask, setCurrentTask, setActivePage, updateAICapability } = useAppStore()

  const [step, setStep] = useState(1)
  const [taskName, setTaskName] = useState('')
  const [folderPath, setFolderPath] = useState('')
  const [multiAIMode, setMultiAIMode] = useState(false)
  const [selectedMainModels, setSelectedMainModels] = useState<string[]>([])
  const [selectedSubModels, setSelectedSubModels] = useState<string[]>([])
  const [selectedSingleModel, setSelectedSingleModel] = useState<string>('')

  const enabledModels = models.filter(m => m.enabled)

  // Default single model to first enabled
  if (!selectedSingleModel && enabledModels.length > 0) {
    setSelectedSingleModel(enabledModels[0].id)
  }

  const handleSelectFolder = async () => {
    const path = await window.electronAPI?.dialog.selectFolder()
    if (path) {
      setFolderPath(path)
    }
  }

  const toggleMainModel = (modelId: string) => {
    setSelectedMainModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      }
      if (prev.length >= 2) return prev // Max 2 main models
      return [...prev, modelId]
    })
  }

  const toggleSubModel = (modelId: string) => {
    setSelectedSubModels(prev => {
      if (prev.includes(modelId)) {
        return prev.filter(id => id !== modelId)
      }
      return [...prev, modelId]
    })
  }

  const handleCreate = async () => {
    if (!taskName.trim() || !folderPath) return

    // For single AI mode, use selectedSingleModel as mainModels
    const mainModels = multiAIMode ? selectedMainModels : (selectedSingleModel ? [selectedSingleModel] : [])

    const newTask: Task = {
      id: uuidv4(),
      name: taskName,
      folderPath,
      multiAIMode,
      mainModels,
      subModels: selectedSubModels,
      status: 'pending',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
      subtasks: [],
    }

    await addTask(newTask)
    setCurrentTask(newTask)
    setActivePage('projects')
    onClose()
  }

  const canProceed = () => {
    if (step === 1) return taskName.trim() && folderPath
    if (step === 2 && multiAIMode) return selectedMainModels.length > 0
    if (step === 2 && !multiAIMode) return selectedSingleModel !== ''
    if (step === 3 && multiAIMode) return selectedSubModels.length > 0
    return true
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-800">新建任务</h2>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
              步骤 {step}/3
            </span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((s) => (
              <React.Fragment key={s}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                    step >= s
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 rounded ${step > s ? 'bg-primary-500' : 'bg-gray-100'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>基本信息</span>
            <span>选择主模型</span>
            <span>选择附属模型</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">任务名称</label>
                <input
                  type="text"
                  value={taskName}
                  onChange={(e) => setTaskName(e.target.value)}
                  placeholder="输入任务名称，如：网站开发、数据分析..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">工作文件夹 <span className="text-red-500">*</span></label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={folderPath}
                    readOnly
                    placeholder="请选择工作文件夹（必选）"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={handleSelectFolder}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-medium text-gray-700 transition-colors flex items-center gap-2"
                  >
                    <FolderOpen size={16} />
                    选择文件夹
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="text-sm font-medium text-gray-700">开启多AI合作模式</div>
                  <div className="text-xs text-gray-500 mt-0.5">多个AI模型协同完成复杂任务</div>
                </div>
                <button
                  onClick={() => setMultiAIMode(!multiAIMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    multiAIMode ? 'bg-primary-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                      multiAIMode ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Select Main Models */}
          {step === 2 && multiAIMode && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-primary-700">
                  <Bot size={18} />
                  <span className="text-sm font-medium">选择主模型（最多2个）</span>
                </div>
                <p className="text-xs text-primary-600 mt-1">主模型负责协调和分配任务给附属模型</p>
              </div>

              <div className="space-y-2">
                {enabledModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => toggleMainModel(model.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedMainModels.includes(model.id)
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      selectedMainModels.includes(model.id) ? 'bg-primary-500' : 'bg-gray-400'
                    }`}>
                      {model.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                    {model.capability && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {model.capability}
                      </div>
                    )}
                    {selectedMainModels.includes(model.id) && (
                      <Check size={18} className="text-primary-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Select Sub Models */}
          {step === 3 && multiAIMode && (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-green-700">
                  <Zap size={18} />
                  <span className="text-sm font-medium">选择附属模型</span>
                </div>
                <p className="text-xs text-green-600 mt-1">附属模型负责执行具体任务，可以添加任意多个</p>
              </div>

              <div className="space-y-2">
                {enabledModels.filter(m => !selectedMainModels.includes(m.id)).map((model) => (
                  <div
                    key={model.id}
                    onClick={() => toggleSubModel(model.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedSubModels.includes(model.id)
                        ? 'bg-green-50 border-2 border-green-500'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      selectedSubModels.includes(model.id) ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {model.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                    {model.capability && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {model.capability}
                      </div>
                    )}
                    {selectedSubModels.includes(model.id) && (
                      <Check size={18} className="text-green-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Select Single Model for non-multi-AI mode */}
          {step === 2 && !multiAIMode && (
            <div className="space-y-4">
              <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 text-primary-700">
                  <Bot size={18} />
                  <span className="text-sm font-medium">选择执行模型</span>
                </div>
                <p className="text-xs text-primary-600 mt-1">单AI模式下由选定的模型独立完成任务</p>
              </div>

              <div className="space-y-2">
                {enabledModels.map((model) => (
                  <div
                    key={model.id}
                    onClick={() => setSelectedSingleModel(model.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                      selectedSingleModel === model.id
                        ? 'bg-primary-50 border-2 border-primary-500'
                        : 'bg-white border-2 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                      selectedSingleModel === model.id ? 'bg-primary-500' : 'bg-gray-400'
                    }`}>
                      {model.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">{model.name}</div>
                      <div className="text-xs text-gray-500">{model.provider}</div>
                    </div>
                    {model.capability && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {model.capability}
                      </div>
                    )}
                    {selectedSingleModel === model.id && (
                      <Check size={18} className="text-primary-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex-shrink-0">
          <button
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
            className="px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-100 rounded-xl transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={16} />
            {step === 1 ? '取消' : '上一步'}
          </button>
          {step < 3 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              下一步
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={!taskName.trim() || !folderPath}
              className="px-5 py-2.5 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
            >
              <Check size={16} />
              创建任务
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CreateTaskDialog
