'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ExternalLink, Star, Copy, Check, Terminal, BookOpen, Zap, Globe, Server } from 'lucide-react';
import { mcpResources } from '@/data/mcp';

export default function McpDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const mcp = mcpResources.find(m => m.slug === slug);

  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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

  // 模拟扩展数据（后续可移到数据文件）
  const extendedData = {
    longDescription: `${mcp.description}\n\n此 MCP 服务器为 AI 助手提供了强大的扩展能力，可以与现有工作流程无缝集成。适用于需要自动化、集成外部服务的场景。`,
    features: [
      '支持多种操作类型',
      '实时数据同步',
      '安全认证机制',
      '错误重试机制',
    ],
    configuration: {
      envVars: [
        { name: 'API_KEY', description: 'API 访问密钥' },
        { name: 'ENDPOINT', description: '服务器端点地址' },
      ],
      installOptions: mcp.installCmd || `npx @modelcontextprotocol/server-${mcp.slug}`,
    },
    source: mcp.type === 'local' ? '社区开源' : '官方维护',
    rating: Math.min(5, Math.floor(mcp.stars / 200) + 3),
    reviewCount: Math.floor(mcp.stars / 50),
  };

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
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  {mcp.type === 'local' ? (
                    <Server className="w-6 h-6 text-white" />
                  ) : (
                    <Globe className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800 font-outfit">{mcp.name}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`tag text-xs ${mcp.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {mcp.type === 'local' ? '本地 MCP' : '远程 MCP'}
                    </span>
                    <span className="tag tag-primary text-xs">{mcp.category}</span>
                  </div>
                </div>
              </div>

              {/* 收藏按钮 */}
              <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                ☆ 收藏
              </button>
            </div>

            <p className="text-gray-600 leading-relaxed">{mcp.description}</p>
          </div>

          {/* 核心能力 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-blue-500" />
              核心能力
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {extendedData.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  {feature}
                </div>
              ))}
            </div>
          </div>

          {/* 配置方式 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Terminal className="w-5 h-5 text-blue-500" />
              配置方式
            </h2>

            {/* 安装命令 */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">安装命令</h3>
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <code className="text-green-400 font-mono text-xs sm:text-sm break-all">
                  {extendedData.configuration.installOptions}
                </code>
                <button
                  onClick={() => handleCopy(extendedData.configuration.installOptions)}
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

            {/* 环境变量 */}
            {extendedData.configuration.envVars.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">环境变量</h3>
                <div className="space-y-2">
                  {extendedData.configuration.envVars.map((env, i) => (
                    <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg px-4 py-3">
                      <code className="text-blue-600 font-mono text-sm font-semibold">{env.name}</code>
                      <span className="text-gray-500 text-sm">— {env.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Claude Desktop 配置 */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Claude Desktop 配置</h3>
              <div className="bg-gray-900 rounded-lg p-3 sm:p-4 overflow-x-auto">
                <pre className="text-green-400 font-mono text-xs sm:text-sm whitespace-pre">
{`{
  "mcpServers": {
    "${mcp.name}": {
      "command": "${mcp.type === 'local' ? 'npx' : 'node'}",
      "args": ${mcp.type === 'local'
        ? `["@modelcontextprotocol/server-${mcp.slug}"]`
        : `["-e", "require('@modelcontextprotocol/server-${mcp.slug}')"]`}
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 详情说明 */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" />
              详情说明
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {extendedData.longDescription}
              </p>
            </div>
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
                  <span className="text-sm font-medium">官方文档</span>
                </a>
              )}
              <a
                href={`https://github.com/modelcontextprotocol/server-${mcp.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="text-sm font-medium">GitHub 仓库</span>
              </a>
            </div>
          </div>

          {/* 来源说明 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">来源说明</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">来源</span>
                <span className="text-sm font-medium text-gray-800">{extendedData.source}</span>
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

          {/* 点评星级 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">点评星级</h3>
            <div className="space-y-4">
              {/* 星级展示 */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${star <= extendedData.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 text-sm font-medium text-gray-800">{extendedData.rating.toFixed(1)}</span>
              </div>

              {/* 评分统计 */}
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((level) => {
                  const percentage = level === extendedData.rating ? 65 : level > extendedData.rating ? 20 : 10;
                  return (
                    <div key={level} className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 w-3">{level}星</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500 w-8">{percentage}%</span>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 text-center">
                <span className="text-sm text-gray-500">{extendedData.reviewCount} 条点评</span>
              </div>
            </div>
          </div>

          {/* GitHub 统计 */}
          <div className="card">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">社区统计</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 flex items-center gap-1">
                  <Star className="w-4 h-4" /> GitHub Stars
                </span>
                <span className="text-sm font-medium text-gray-800">{mcp.stars.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">贡献者</span>
                <span className="text-sm font-medium text-gray-800">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">最后更新</span>
                <span className="text-sm font-medium text-gray-800">3天前</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
