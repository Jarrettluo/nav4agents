export interface McpResource {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: 'local' | 'remote';
  url?: string;
  installCmd?: string;
  stars: number;
  featured: boolean;
}

export const mcpResources: McpResource[] = [
  {
    id: 1,
    name: 'GitHub MCP',
    slug: 'github-mcp',
    description: '连接 GitHub API，支持仓库管理、Issue 跟踪、PR 操作',
    category: '开发工具',
    type: 'remote',
    url: 'https://github.com/modelcontextprotocol/server-github',
    stars: 1250,
    featured: true,
  },
  {
    id: 2,
    name: 'Filesystem MCP',
    slug: 'filesystem-mcp',
    description: '本地文件系统访问，支持文件读写、目录操作',
    category: '开发工具',
    type: 'local',
    installCmd: 'npx @modelcontextprotocol/server-filesystem ~/projects',
    stars: 980,
    featured: true,
  },
  {
    id: 3,
    name: 'Slack MCP',
    slug: 'slack-mcp',
    description: 'Slack 消息发送、频道管理、用户搜索',
    category: '效率工具',
    type: 'remote',
    url: 'https://github.com/modelcontextprotocol/server-slack',
    stars: 650,
    featured: false,
  },
  {
    id: 4,
    name: 'Brave Search MCP',
    slug: 'brave-search-mcp',
    description: '网络搜索能力，支持实时信息查询',
    category: '信息获取',
    type: 'remote',
    url: 'https://github.com/modelcontextprotocol/server-brave-search',
    stars: 820,
    featured: true,
  },
  {
    id: 5,
    name: 'Postgres MCP',
    slug: 'postgres-mcp',
    description: '数据库查询、执行 SQL、管理表结构',
    category: '开发工具',
    type: 'local',
    installCmd: 'npx @modelcontextprotocol/server-postgres postgresql://localhost/mydb',
    stars: 720,
    featured: false,
  },
  {
    id: 6,
    name: 'Puppeteer MCP',
    slug: 'puppeteer-mcp',
    description: '浏览器自动化，网页截图、元素抓取、表单提交',
    category: '开发工具',
    type: 'local',
    stars: 540,
    featured: false,
  },
  {
    id: 7,
    name: 'Notion MCP',
    slug: 'notion-mcp',
    description: 'Notion 页面管理、数据库操作、知识库集成',
    category: '效率工具',
    type: 'remote',
    url: 'https://github.com/modelcontextprotocol/server-notion',
    stars: 890,
    featured: true,
  },
  {
    id: 8,
    name: 'Sequential Thinking',
    slug: 'sequential-thinking',
    description: '结构化思考工具，帮助 AI 进行深度推理分析',
    category: 'AI 增强',
    type: 'remote',
    url: 'https://github.com/modelcontextprotocol/server-sequential-thinking',
    stars: 1100,
    featured: true,
  },
];

export const categories = [
  '全部',
  '开发工具',
  '效率工具',
  '信息获取',
  'AI 增强',
  '垂直行业',
];

export const mcpTypes = [
  { value: 'all', label: '全部' },
  { value: 'local', label: '本地 MCP' },
  { value: 'remote', label: '远程 MCP' },
];