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
      <div className="mb-4 space-y-3">
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
          {/* 分类筛选 */}
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-3 py-1 text-xs rounded ${
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
            className="ml-auto text-xs border rounded px-2 py-1"
          >
            {mcpTypes.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-gray-500 mb-3">
        共 {filtered.length} 个 MCP 服务器
      </div>

      {/* 列表 */}
      <div className="space-y-3">
        {filtered.map(item => (
          <div key={item.id} className="card">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Link href={`/mcp/${item.slug}`} className="font-medium text-gray-800 hover:text-blue-600">
                    {item.name}
                  </Link>
                  <span className="tag tag-primary text-xs">{item.category}</span>
                  <span className={`tag text-xs ${item.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                    {item.type === 'local' ? '本地' : '远程'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" /> {item.stars}
                  </span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                      <ExternalLink className="w-3 h-3" /> 官方
                    </a>
                  )}
                  {item.installCmd && (
                    <button className="text-blue-600 hover:underline" onClick={() => navigator.clipboard.writeText(item.installCmd || '')}>
                      复制安装命令
                    </button>
                  )}
                </div>
              </div>
              <button className="text-gray-400 hover:text-blue-600 text-sm ml-2">
                ☆ 收藏
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