export interface Skill {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  source: string;
  installCmd?: string;
  usage: number;
  featured: boolean;
}

export const skills: Skill[] = [
  {
    id: 1,
    name: 'Auto Code Review',
    slug: 'auto-code-review',
    description: '自动代码审查工具，检查代码质量、安全漏洞、性能问题',
    category: '开发辅助',
    source: '社区',
    installCmd: 'npx skillfish add codereview/auto-review',
    usage: 3200,
    featured: true,
  },
  {
    id: 2,
    name: 'API Docs Generator',
    slug: 'api-docs-generator',
    description: '自动生成 RESTful API 文档，支持 OpenAPI 规范',
    category: '开发辅助',
    source: '自研',
    usage: 1800,
    featured: true,
  },
  {
    id: 3,
    name: 'SQL Query Optimizer',
    slug: 'sql-query-optimizer',
    description: 'SQL 查询分析和优化建议，提升数据库性能',
    category: '开发辅助',
    source: '社区',
    usage: 1450,
    featured: false,
  },
  {
    id: 4,
    name: 'Unit Test Generator',
    slug: 'unit-test-generator',
    description: '根据代码自动生成单元测试用例',
    category: '开发辅助',
    source: '社区',
    usage: 2100,
    featured: true,
  },
  {
    id: 5,
    name: 'Markdown Formatter',
    slug: 'markdown-formatter',
    description: 'Markdown 文件格式化、目录生成、链接检查',
    category: '内容处理',
    source: '自研',
    usage: 980,
    featured: false,
  },
  {
    id: 6,
    name: 'Data Visualization',
    slug: 'data-visualization',
    description: '将数据转化为图表，支持多种可视化类型',
    category: '内容处理',
    source: '社区',
    usage: 1650,
    featured: true,
  },
  {
    id: 7,
    name: 'Security Scanner',
    slug: 'security-scanner',
    description: '代码安全扫描，检测常见漏洞和风险',
    category: '开发辅助',
    source: '社区',
    usage: 1900,
    featured: false,
  },
  {
    id: 8,
    name: 'Git Workflow Helper',
    slug: 'git-workflow-helper',
    description: 'Git 操作辅助，简化分支管理、冲突解决流程',
    category: '开发辅助',
    source: '自研',
    usage: 2200,
    featured: true,
  },
];

export const skillCategories = [
  '全部',
  '开发辅助',
  '内容处理',
  'AI 增强',
  '效率工具',
];

export const skillSources = [
  { value: 'all', label: '全部来源' },
  { value: 'self', label: '自研' },
  { value: 'community', label: '社区' },
];