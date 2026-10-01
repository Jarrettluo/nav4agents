import detailsData from '@/data/generated/mcp-details.json';

// 由 scripts/enhance_details.py 生成的增强数据（工具列表 / 配置项 / 认证等）
export interface McpDetailTool {
  name: string;
  description: string;
  /** 中文描述（翻译管线生成） */
  descriptionZh?: string | null;
}

export interface McpDetailConfig {
  name: string;
  required: boolean;
  description: string;
  /** 中文描述（翻译管线生成） */
  descriptionZh?: string | null;
}

// 由 scripts/enhance_details.py 生成的增强数据（工具列表 / 配置项 / 认证等）
export interface McpDetailData {
  tools: McpDetailTool[];
  config: McpDetailConfig[];
  remoteUrl: string | null;
  iconUrl: string | null;
  verified: boolean;
  homepage?: string | null;
}

const map = detailsData as unknown as Record<string, McpDetailData>;

export const getMcpDetail = (slug: string): McpDetailData | null => map[slug] || null;