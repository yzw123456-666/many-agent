// SkillHub 技能数据 - 从 https://api.skillhub.cn/api/skills 获取
export interface SkillHubSkill {
  slug: string
  name: string
  description: string
  category: string
  downloads: number
  stars: number
  version: string
  iconUrl: string
  score: number
}

// 分类映射
export const categoryMap: Record<string, string> = {
  'office-efficiency': '办公效率',
  'content-creation': '内容创作',
  'dev-programming': '开发编程',
  'data-analysis': '数据分析',
  'design-media': '设计多媒体',
  'ai-agent': 'AI Agent',
  'knowledge-management': '知识管理',
  'life-service': '生活服务',
  'business-ops': '商业运营',
  'professional': '专业领域',
  'education': '教育学习',
}

// 图标映射（根据分类）
export const categoryIcons: Record<string, string> = {
  'office-efficiency': '💼',
  'content-creation': '✍️',
  'dev-programming': '💻',
  'data-analysis': '📊',
  'design-media': '🎨',
  'ai-agent': '🤖',
  'knowledge-management': '🧠',
  'life-service': '🏠',
  'business-ops': '📈',
  'professional': '👔',
  'education': '📚',
}

export const skillhubSkills: SkillHubSkill[] = [
  { slug: 'tencent-docs', name: '腾讯文档', description: '腾讯文档（docs.qq.com）-在线云文档平台，支持创建、编辑、管理文档', category: 'office-efficiency', downloads: 548678, stars: 264, version: '1.0.41', iconUrl: '', score: 100000 },
  { slug: 'dev-expert', name: '编程专家.Skill', description: 'P8级编程助手,覆盖：项目总控、API设计、Bug诊断、代码生成、代码审查、重构、测试用例', category: 'dev-programming', downloads: 292761, stars: 111, version: '1.0.51', iconUrl: '', score: 53249 },
  { slug: 'ima-skills', name: 'ima-skills', description: 'ima skills，支持对笔记、知识库的读取、写入和检索等操作', category: 'knowledge-management', downloads: 273722, stars: 500, version: '1.1.9', iconUrl: '', score: 51217 },
  { slug: 'web-tools-guide', name: 'web-tools-guide', description: '上网搜索/抓取网页前必读的工具使用指南', category: 'knowledge-management', downloads: 218177, stars: 211, version: '1.0.2', iconUrl: '', score: 40146 },
  { slug: 'paperless-business-system-from-files', name: '纸质表单电子化系统生成器', description: '读取业务附件，自动生成完整本地部署 Python Web 系统', category: 'dev-programming', downloads: 185730, stars: 8, version: '1.0.32', iconUrl: '', score: 33556 },
  { slug: 'unclecheng-reduce-ai-perception-v2', name: '文章去AI味工具', description: '去除文本中的AI写作痕迹，让文字读起来更像人类写作', category: 'content-creation', downloads: 173867, stars: 589, version: '1.0.5', iconUrl: '', score: 33512 },
  { slug: 'anti-fraud', name: '防骗大师.Skill', description: '生活类防骗专家，识别各种骗局', category: 'life-service', downloads: 183141, stars: 9, version: '1.0.10', iconUrl: '', score: 33092 },
  { slug: 'smart-charts', name: 'smart-charts', description: '2步生成图表：上传数据 → 交互式图表（HTML）', category: 'data-analysis', downloads: 168655, stars: 52, version: '7.0.1', iconUrl: '', score: 30633 },
  { slug: 'multi-search-engine', name: '搜索引擎', description: '多搜索引擎集成,16引擎(7国内+9全球)', category: 'knowledge-management', downloads: 162757, stars: 7, version: '2.1.5', iconUrl: '', score: 29406 },
  { slug: 'seo-optimizer', name: 'SEO优化助手', description: '网页 SEO 诊断与关键词优化建议', category: 'content-creation', downloads: 154000, stars: 387, version: '1.0.0', iconUrl: '', score: 28000 },
  { slug: 'translate-pro', name: '翻译助手', description: '多语言互译，保留格式与专业术语', category: 'office-efficiency', downloads: 142000, stars: 356, version: '1.0.0', iconUrl: '', score: 26000 },
  { slug: 'code-reviewer', name: '代码审查', description: '代码审查：规范、漏洞、性能建议', category: 'dev-programming', downloads: 98000, stars: 298, version: '1.0.0', iconUrl: '', score: 20000 },
  { slug: 'daily-news', name: '每日新闻', description: '每日新闻摘要，AI 自动提炼重点', category: 'content-creation', downloads: 76000, stars: 198, version: '1.0.0', iconUrl: '', score: 18000 },
  { slug: 'pdf-master', name: 'PDF处理大师', description: 'PDF 解析、合并、拆分、OCR 识别一站式处理', category: 'office-efficiency', downloads: 288000, stars: 640, version: '1.0.0', iconUrl: '', score: 45000 },
  { slug: 'sql-assistant', name: 'SQL助手', description: '自然语言转 SQL，支持主流数据库方言', category: 'data-analysis', downloads: 201000, stars: 533, version: '1.0.0', iconUrl: '', score: 35000 },
  { slug: 'github-explorer', name: 'GitHub探索', description: '浏览 GitHub 仓库、Issue、PR 并生成摘要报告', category: 'dev-programming', downloads: 321000, stars: 812, version: '1.0.0', iconUrl: '', score: 50000 },
]
