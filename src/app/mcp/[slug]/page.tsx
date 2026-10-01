import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Star, Terminal, Zap, Globe, Server, Settings, BadgeCheck } from 'lucide-react';
import { getAllMcp } from '@/lib/data/mcp';
import { getMcpDetail } from '@/lib/data/mcpDetails';
import { buildMcpMetadata, ogImage } from '@/lib/seo';
import { displayDesc } from '@/lib/i18n';
import CopyButton from '@/components/CopyButton';
import FavoriteButton from '@/components/FavoriteButton';
import HiddenShareImage from '@/components/HiddenShareImage';

// 静态生成全部详情页（SSG）：原始 HTML 即含完整内容 + OG 标签，微信/搜索爬虫可读
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllMcp().map((m) => ({ slug: m.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const res = getMcpBySlugSync(params.slug);
  if (!res) return { title: 'MCP 服务器不存在' };
  return buildMcpMetadata(res);
}

// 同步取数据（构建期）
function getMcpBySlugSync(slug: string) {
  return getAllMcp().find((x) => x.slug === slug) || null;
}

export default function McpDetailPage({ params }: { params: { slug: string } }) {
  const mcp = getMcpBySlugSync(params.slug);
  if (!mcp) notFound();

  const detail = getMcpDetail(mcp.slug);
  const installCmd = mcp.installCmd || '';
  const hasTools = !!detail?.tools?.length;
  const hasConfig = !!detail?.config?.length;

  return (
    <div>
      <HiddenShareImage src={ogImage.sqMcp(mcp.slug)} />
      {/* 返回链接 */}
      <Link
        href="/mcp"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        返回 MCP 服务器
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧主内容 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 头部卡片 */}
          <div className="card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {detail?.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={detail.iconUrl}
                    alt={mcp.name}
                    className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1.5 flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                    {mcp.type === 'local' ? (
                      <Server className="w-6 h-6 text-white" />
                    ) : (
                      <Globe className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2 font-outfit break-words">
                    {mcp.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {detail?.verified && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full whitespace-nowrap">
                        <BadgeCheck className="w-3.5 h-3.5" />已验证
                      </span>
                    )}
                    <span className={`tag text-xs whitespace-nowrap ${mcp.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {mcp.type === 'local' ? '本地 MCP' : '远程 MCP'}
                    </span>
                    <span className="tag tag-primary text-xs whitespace-nowrap">{mcp.category}</span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">来源：{mcp.source || '——'}</span>
                  </div>
                </div>
              </div>

              {/* 操作区（客户端组件，收藏状态存本地浏览器） */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <FavoriteButton type="mcp" itemId={mcp.id} size="md" />
              </div>
            </div>

            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">{displayDesc(mcp.descriptionZh, mcp.description)}</p>
          </div>

          {/* 工具能力（真实数据） */}
          {hasTools ? (
            <div className="card">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-500" />
                工具能力
                <span className="text-xs font-normal text-gray-400">（{detail!.tools.length} 个工具）</span>
              </h2>
              <div className="space-y-3">
                {detail!.tools.map((tool, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg px-4 py-3">
                    <code className="text-blue-700 font-mono text-sm font-semibold">{tool.name}</code>
                    {tool.description && (
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{displayDesc(tool.descriptionZh, tool.description)}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {/* 配置方式 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              配置方式
            </h2>

            {/* 安装命令 */}
            {installCmd ? (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">安装命令</h3>
                <div className="bg-gray-900 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <code className="text-green-400 font-mono text-xs sm:text-sm break-all">
                    {installCmd}
                  </code>
                  <CopyButton text={installCmd} dark />
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-6">暂无标准安装命令，请通过上方官网了解接入方式。</p>
            )}

            {/* 配置项（真实数据） */}
            {hasConfig && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                  <Settings className="w-4 h-4" />
                  配置项
                </h3>
                <div className="space-y-2">
                  {detail!.config.map((env, i) => (
                    <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 bg-gray-50 rounded-lg px-4 py-3">
                      <code className="text-blue-600 font-mono text-sm font-semibold whitespace-nowrap">
                        {env.name}
                        {env.required && <span className="text-red-500 ml-1" title="必填">*</span>}
                      </code>
                      <span className="text-gray-500 text-sm">{displayDesc(env.descriptionZh, env.description) || '——'}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">带 * 为必填配置项</p>
              </div>
            )}
          </div>
        </div>

        {/* 右侧边栏 */}
        <div className="space-y-6">
          {/* 跳转链接 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">跳转链接</h3>
            <div className="space-y-2">
              {mcp.url && (
                <a
                  href={mcp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">官方网站</span>
                </a>
              )}
              {detail?.remoteUrl && (
                <a
                  href={detail.remoteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 transition-colors"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-sm font-medium">远程服务地址</span>
                </a>
              )}
              {mcp.smitheryId ? (
                <a
                  href={`https://smithery.ai/servers/${mcp.smitheryId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">在 Smithery 查看</span>
                </a>
              ) : (
                <a
                  href={`https://registry.modelcontextprotocol.io/v0/servers?search=${encodeURIComponent(mcp.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span className="text-sm font-medium">在官方注册表查看</span>
                </a>
              )}
            </div>
          </div>

          {/* 来源说明 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">来源说明</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">数据源</span>
                <span className="text-sm font-medium text-gray-800">{mcp.source || '——'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">分类</span>
                <span className="tag tag-primary text-xs">{mcp.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">类型</span>
                <span className={`tag text-xs ${mcp.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                  {mcp.type === 'local' ? '本地部署' : '远程调用'}
                </span>
              </div>
            </div>
          </div>

          {/* 使用数据 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">使用数据</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="w-4 h-4" /> 热度
                </span>
                <span className="text-sm font-medium text-gray-800">
                  {mcp.stars > 0 ? `${mcp.stars.toLocaleString()} 次调用` : '官方收录'}
                </span>
              </div>
              {detail?.verified && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">认证状态</span>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
                    <BadgeCheck className="w-4 h-4" />已验证
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}