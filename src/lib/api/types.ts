// 通用响应类型
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 分页结果
export interface PageResult<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

// 用户相关
export interface User {
  id: number;
  email: string;
  username: string;
  avatar?: string;
  role: string;
}

export interface LoginResult {
  userId: number;
  username: string;
  email: string;
  avatar?: string;
  token: string;
}

// Skill 相关
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
  githubUrl?: string;
}

// MCP 相关
export interface McpServer {
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

// 订阅方案相关
export interface Subscription {
  id: number;
  platform: string;
  product: string;
  price: number;
  priceUnit: string;
  frequency: 'monthly' | 'yearly' | 'once';
  description: string;
  features: string[];
  logo: string;
  link: string;
  category: 'IDE' | '聊天助手' | '云IDE' | 'CLI';
}

// 收藏相关
export type FavoriteType = 'skill' | 'mcp' | 'subscription';

export interface Favorite {
  id: number;
  userId: number;
  type: FavoriteType;
  itemId: number;
  createdAt: string;
}

export interface FavoriteItem {
  id: number;
  type: FavoriteType;
  itemId: number;
  // 包含关联对象的完整数据
  skill?: Skill;
  mcp?: McpServer;
  subscription?: Subscription;
}

// 首页数据
export interface HomeData {
  featuredMcp: McpServer[];
  featuredSkills: Skill[];
  recentItems: Array<{
    type: 'MCP' | 'Skill';
    name: string;
    slug: string;
    time: string;
  }>;
  stats: {
    mcpCount: number;
    skillCount: number;
    subscriptionCount: number;
  };
}

// 搜索结果
export interface SearchResult {
  skills?: Skill[];
  mcps?: McpServer[];
  subscriptions?: Subscription[];
}
