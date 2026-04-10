'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Star, ExternalLink } from 'lucide-react';
import { mcpResources, categories, mcpTypes } from '@/data/mcp';

export default function McpPage() {
  const [category, setCategory] = useState('全部');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = mcpResources.filter(item => {
    if (category !== '全部' && item.category !== category) return false;
    if (type !== 'all' && item.type !== type) return false;
    if (search && !item.name.includes(search) && !item.description.includes(search)) return false;
    return true;
  });

  return (
    <div>
      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索 MCP 服务器..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input pl-9"
          />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* 分类筛选 - Pill 按钮 */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* 类型筛选 */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="ml-auto text-xs sm:text-sm border border-gray-200 rounded-full px-3 py-1.5 sm:px-4 sm:py-2 bg-white"
          >
            {mcpTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-gray-500 mb-4">
        共 {filtered.length} 个 MCP 服务器
      </div>

      {/* 列表 */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="ai-card">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                  <Link href={`/mcp/${item.slug}`} className="font-semibold text-gray-800 hover:text-blue-600 text-sm sm:text-base">
                    {item.name}
                  </Link>
                  <span className="tag tag-primary text-xs">{item.category}</span>
                  <span className={`tag text-xs ${item.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {item.type === 'local' ? '本地' : '远程'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2 sm:mb-3 line-clamp-2">{item.description}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {item.stars}
                  </span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                      <ExternalLink className="w-3 h-3" /> 官方
                    </a>
                  )}
                  {item.installCmd && (
                    <button className="text-blue-600 hover:underline whitespace-nowrap" onClick={() => navigator.clipboard.writeText(item.installCmd || '')}>
                      复制安装
                    </button>
                  )}
                </div>
              </div>
              <button className="text-gray-400 hover:text-blue-600 text-sm self-start sm:ml-2">
                ☆
              </button>
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          没有找到相关 MCP 服务器
        </div>
      )}
    </div>
  );
}
