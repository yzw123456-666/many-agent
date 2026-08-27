# Many AI - 智能助手桌面应用

一个基于 Electron + React + TypeScript 的多智能体桌面应用，支持多模型协作完成复杂任务。

## ✨ 核心特性

### 🤖 多智能体协作
- **任务编排引擎**：自动将复杂任务拆分为子任务，分配给不同模型并行执行
- **主模型验收**：子任务完成后由主模型进行质量审查，不合格自动返工修正
- **独立思考链**：每个子任务拥有独立上下文，不互相污染
- **覆盖冲突检测**：自动检测多模型同时修改同一文件的冲突

### 🧠 智能上下文管理
- **共享上下文环**：黑弧=已用，灰弧=剩余，直观显示token消耗
- **80%自动压缩**：使用LLM摘要（非暴力截断），保留任务目标/文件路径/代码/未完成项
- **防抖保护**：≥4条新消息后才触发压缩，避免频繁调用

### 🎯 实时交互系统
- **三色思考链**：蓝色呼吸动画→黑色展开→折叠后白色文字
- **工具结果卡片**：可展开的工具调用详情（读写文件、执行命令等）
- **安全警告卡片**：危险命令（rm -rf/del /f等）拦截并确认
- **内联问答选项**：编号按钮直接选择，无需弹窗

### 📋 任务管理
- **折叠式任务面板**：显示已完成/进行中/待处理任务数量
- **侧边栏AI状态**：实时显示每个模型的上下文使用率
- **独立工作区**：点击任务卡片进入专属聊天界面

### 🌐 国际化支持
- 中文/英文双语切换
- 自动检测系统语言

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 18 + TypeScript |
| UI样式 | Tailwind CSS |
| 状态管理 | Zustand (持久化到Electron Store) |
| 路由 | React Router v6 |
| Markdown | react-markdown + remark-gfm + react-syntax-highlighter |
| 图标 | Lucide React |
| 国际化 | react-i18next |
| 桌面框架 | Electron 32 |
| 构建工具 | Vite 5 |
| 打包 | electron-builder |

## 🚀 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 开发模式
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run electron:dev
```

### 构建打包
```bash
# Windows NSIS安装包
npm run electron:build:win

# Windows便携版
npm run electron:build:portable
```

## 📁 项目结构

```
src/
├── components/          # UI组件
│   ├── ChatMessage.tsx     # 聊天消息渲染（含思考链、代码块）
│   ├── ContextRing.tsx     # 共享上下文环组件
│   ├── InputArea.tsx       # 输入区域（含文件上传、模型选择）
│   ├── Markdown.tsx        # Markdown渲染器
│   ├── Sidebar.tsx         # 侧边栏（会话列表+AI状态）
│   ├── TaskChecklist.tsx   # 任务检查清单
│   ├── TaskWorkspace.tsx   # 任务工作区（主聊天界面）
│   └── ThinkingBlock.tsx   # 可折叠思考链组件
├── engine/              # 任务编排引擎
│   └── agentEngine.ts      # 核心：runAgentLoop + orchestrate
├── hooks/               # 自定义Hooks
├── i18n/                # 国际化配置
│   └── index.ts
├── stores/              # 状态管理
│   └── index.ts            # Zustand Store
├── types/               # TypeScript类型定义
│   └── index.ts
├── utils/               # 工具函数
├── App.tsx              # 主应用（路由+布局）
└── main.tsx             # 入口
electron/
├── preload.ts           # 预加载脚本
└── main.ts              # Electron主进程
```

## 🎮 使用指南

1. **新建会话**：点击侧边栏"+"按钮
2. **切换会话**：点击侧边栏会话条目
3. **选择模型**：点击输入框上方模型标签
4. **新建任务**：点击"+新任务"按钮
5. **上传文件**：点击附件图标或直接拖拽
6. **查看思考过程**：点击"查看完整思考过程"展开
7. **折叠/展开**：点击蓝色标题栏折叠/展开消息
8. **切换语言**：点击侧边栏底部语言图标

## ⚙️ 配置

在"设置"页面中可以：
- 添加/编辑/删除AI模型
- 配置模型API地址、密钥、参数
- 设置主模型（带皇冠👑标识）
- 调整温度、Top-P等生成参数

## 📄 License

MIT License
