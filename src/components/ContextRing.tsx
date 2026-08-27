import React from 'react'

// 上下文用量环形指示器（共享）：黑色=已用，灰色=剩余
const ContextRing: React.FC<{ used: number; max: number; size?: number }> = ({ used, max, size = 24 }) => {
  const pct = Math.min(100, Math.max(0, Math.round((used / max) * 100)))
  const stroke = size <= 16 ? 2.5 : 3
  const r = 12 - stroke
  const circumference = 2 * Math.PI * r
  const arcColor = pct >= 90 ? '#ef4444' : '#1f2937'
  const px = size
  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: px, height: px }}
      title={`上下文：${used.toLocaleString()} / ${max.toLocaleString()} tokens（${pct}%）${pct >= 80 ? ' · 已自动压缩' : ''}`}
    >
      <svg viewBox="0 0 24 24" width={px} height={px} className="-rotate-90">
        <circle cx="12" cy="12" r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        {pct > 0 && (
          <circle
            cx="12" cy="12" r={r} fill="none"
            stroke={arcColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 0.3s' }}
          />
        )}
      </svg>
      {size >= 20 && (
        <span className="absolute inset-0 flex items-center justify-center text-[7px] font-medium text-gray-500">{pct}</span>
      )}
    </div>
  )
}

export default ContextRing
