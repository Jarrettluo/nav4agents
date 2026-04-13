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

// Skill 相关 - 与后端 SkillDTO 对齐
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
  // 后端额外字段
  markdownContent?: string;    // SKILL.md 内容（后端直接提供，无需前端再请求）
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

// MCP 相关 - 与后端 McpServerDTO 对齐
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
  // 后端额外字段
  longDescription?: string;
  features?: string;       // 后端返回的是逗号分隔的字符串，前端需解析
  configuration?: string;
  rating?: number;
  reviewCount?: number;
  source?: string;
  contributors?: number;
  lastUpdated?: string;
  createdAt?: string;
  updatedAt?: string;
}

// 订阅方案相关 - 与后端 SubscriptionDTO 对齐
export interface Subscription {
  id: number;
  platform: string;
  product: string;
  price: number;
  priceUnit: string;
  frequency: string;           // 后端返回的是字符串，前端可映射显示
  description: string;
  features: string;            // 后端返回逗号分隔的字符串，前端需解析
  logo: string;
  link: string;
  category: string;            // 后端返回字符串，非联合类型
  // 后端额外字段
  rating?: number;
  reviewCount?: number;
  createdAt?: string;
  updatedAt?: string;
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

// 首页数据 - 与后端 HomeDataDTO 对齐
export interface HomeData {
  featuredMcp: McpServer[];
  featuredSkills: Skill[];
  // 后端字段名: recentAdded -> 前端映射为 recentItems
  recentAdded?: Array<{
    type: string;
    name: string;
    slug: string;
    addedAt?: string;
  }>;
  // 后端字段名: addedAt -> 前端映射为 time (兼容处理)
  recentItems?: Array<{
    type: string;
    name: string;
    slug: string;
    time?: string;
  }>;
  // 后端返回额外字段
  freeSubscriptions?: Subscription[];
  categories?: Record<string, string[]>;
  stats?: {
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
