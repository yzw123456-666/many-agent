import React, { useState } from 'react'
import { Check, ChevronDown, ChevronUp } from 'lucide-react'
import { useAppStore } from '../stores'
import { SubTask } from '../types'

interface TaskChecklistProps {
  taskId: string
}

const TaskChecklist: React.FC<TaskChecklistProps> = ({ taskId }) => {
  const { tasks, toggleSubtask } = useAppStore()
  const [expanded, setExpanded] = useState(true)
  const task = tasks.find(t => t.id === taskId)
  if (!task || task.subtasks.length === 0) return null

  const completedCount = task.subtasks.filter(s => s.completed).length
  const totalCount = task.subtasks.length
  // 第一个未完成的任务视为"进行中"
  const activeIdx = task.subtasks.findIndex(s => !s.completed)

  const renderIndicator = (subtask: SubTask, idx: number) => {
    if (subtask.completed) {
      return (
        <div className="w-[18px] h-[18px] rounded-[5px] bg-emerald-500 flex items-center justify-center flex-shrink-0">
          <Check size={12} strokeWidth={3} className="text-white" />
        </div>
      )
    }
    if (idx === activeIdx) {
      // 进行中：深色圆点（radio 样式）
      return (
        <div className="w-[18px] h-[18px] rounded-full bg-gray-500 flex items-center justify-center flex-shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      )
    }
    // 待办：空心方框
    return (
      <div className="w-[18px] h-[18px] rounded-[5px] border-[1.5px] border-gray-300 flex-shrink-0" />
    )
  }

  return (
    <div className="bg-gray-50/80 border border-gray-200/70 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center px-3.5 py-2.5 hover:bg-gray-100/70 transition-colors"
      >
        <span className="text-[13px] text-gray-500">
          已完成 {completedCount} 个任务（共 {totalCount} 个）
        </span>
        <div className="flex-1" />
        {expanded ? (
          <ChevronUp size={14} className="text-gray-400" />
        ) : (
          <ChevronDown size={14} className="text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="px-3.5 pb-2 pt-0.5">
          {task.subtasks.map((subtask, idx) => (
            <div
              key={subtask.id}
              onClick={() => toggleSubtask(taskId, subtask.id)}
              className="flex items-center gap-2.5 py-[7px] hover:bg-gray-100/60 cursor-pointer transition-colors rounded-md px-1 -mx-1"
            >
              {renderIndicator(subtask, idx)}
              <span className={`text-[13px] leading-snug ${
                subtask.completed ? 'text-gray-400 line-through' : 'text-gray-700'
              }`}>
                {subtask.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TaskChecklist
