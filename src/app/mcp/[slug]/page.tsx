'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star, Copy, Check, Terminal, Zap, Globe, Server, Loader2, Settings } from 'lucide-react';
import { getMcpBySlug } from '@/lib/data/mcp';
import { addFavorite, removeFavorite, checkFavorite } from '@/lib/data/favorites';
import type { McpServer } from '@/lib/data/types';

interface McpDetail {
  tools: { name: string; description: string }[];
  config: { name: string; required: boolean; description: string }[];
  remoteUrl: string | null;
  iconUrl: string | null;
  verified: boolean;
  homepage?: string | null;
}

export default function McpDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [loading, setLoading] = useState(true);
  const [mcp, setMcp] = useState<McpServer | null>(null);
  const [detail, setDetail] = useState<McpDetail | null>(null);
  const [copied, setCopied] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    const fetchMcp = async () => {
      try {
        setLoading(true);
        const res = await getMcpBySlug(slug);
        if (res.code === 200) {
          setMcp(res.data);
          const favRes = await checkFavorite('mcp', res.data.id);
          setIsFavorited(favRes.data?.isFavorited || false);
        }
      } catch (err) {
        console.error('获取 MCP 服务器失败:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMcp();
  }, [slug]);

  // 详情增强数据（工具列表/配置项）运行时从静态 JSON 加载，不进构建产物
  useEffect(() => {
    let cancelled = false;
    fetch('/data/mcp-details.json')
      .then((r) => (r.ok ? r.json() : null))
      .then((map) => {
        if (!cancelled && map && map[slug]) setDetail(map[slug] as McpDetail);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleToggleFavorite = async () => {
    if (!mcp?.id) return;

    try {
      setFavoriting(true);
      if (isFavorited) {
        await removeFavorite('mcp', mcp.id);
        setIsFavorited(false);
      } else {
        await addFavorite('mcp', mcp.id);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    } finally {
      setFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!mcp) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-semibold text-gray-800 mb-4">MCP 服务器不存在</h1>
        <Link href="/mcp" className="text-blue-600 hover:underline">
          返回列表
        </Link>
      </div>
    );
  }

  const installCmd = mcp.installCmd || '';
  const hasTools = !!detail?.tools?.length;
  const hasConfig = !!detail?.config?.length;

  return (
    <div>
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
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {detail?.iconUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={detail.iconUrl}
                    alt={mcp.name}
                    className="w-12 h-12 rounded-xl object-contain bg-gray-50 p-1.5"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {mcp.type === 'local' ? (
                      <Server className="w-6 h-6 text-white" />
                    ) : (
                      <Globe className="w-6 h-6 text-white" />
                    )}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 font-outfit">
                    {mcp.name}
                    {detail?.verified && (
                      <span className="ml-2 align-middle text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full">✓ 已验证</span>
                    )}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`tag text-xs ${mcp.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {mcp.type === 'local' ? '本地 MCP' : '远程 MCP'}
                    </span>
                    <span className="tag tag-primary text-xs">{mcp.category}</span>
                    <span className="text-xs text-gray-400">来源：{mcp.source || '——'}</span>
                  </div>
                </div>
              </div>

              {/* 收藏按钮 */}
              <button
                onClick={handleToggleFavorite}
                disabled={favoriting}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isFavorited ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isFavorited ? '★ 已收藏' : '☆ 收藏'}
              </button>
            </div>

            <p className="text-gray-600 leading-relaxed">{mcp.description}</p>
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
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{tool.description}</p>
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
                  <button
                    onClick={() => handleCopy(installCmd)}
                    className="p-2 hover:bg-gray-800 rounded transition-colors self-end sm:self-auto"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
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
                      <span className="text-gray-500 text-sm">{env.description || '——'}</span>
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
                  <span className="text-sm font-medium text-green-600">✓ 已验证</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}