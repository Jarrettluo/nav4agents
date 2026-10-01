// 通用响应类型（静态数据层沿用旧接口形状，便于页面迁移）
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
  githubUrl?: string | null;
  ownerHandle?: string;
  rawSlug?: string;
  url?: string;
  topics?: string[];
  version?: string | null;
  changelog?: string | null;
  createdAt?: string;
}

// MCP 相关
export interface McpServer {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string;
  type: 'local' | 'remote';
  url?: string | null;
  installCmd?: string | null;
  stars: number;
  featured: boolean;
  source?: string;
  smitheryId?: string;
  createdAt?: string;
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
    codingplanCount: number;
  };
}
