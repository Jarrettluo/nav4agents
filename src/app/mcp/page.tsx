'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, ExternalLink, Loader2 } from 'lucide-react';
import { getMcpServers, getMcpCategories } from '@/lib/api/mcp';
import { checkFavorite, addFavorite, removeFavorite } from '@/lib/api/favorites';
import type { McpServer } from '@/lib/api/types';

const typeLabels: Record<string, string> = {
  'local': '本地',
  'remote': '远程',
};

export default function McpPage() {
  const [loading, setLoading] = useState(true);
  const [mcpServers, setMcpServers] = useState<McpServer[]>([]);
  const [categories, setCategories] = useState<string[]>(['全部']);
  const [category, setCategory] = useState('全部');
  const [type, setType] = useState('all');
  const [search, setSearch] = useState('');
  const [favoritedIds, setFavoritedIds] = useState<number[]>([]);
  const [favoritingIds, setFavoritingIds] = useState<number[]>([]);

  const fetchMcpServers = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (category !== '全部') params.category = category;
      if (type !== 'all') params.type = type;
      if (search) params.search = search;

      const res = await getMcpServers(params);
      if (res.code === 200) {
        setMcpServers(res.data.list || []);
        // 检查每个 item 的收藏状态
        const newFavorited: number[] = [];
        for (const mcp of res.data.list || []) {
          if (mcp.id) {
            try {
              const favRes = await checkFavorite('mcp', mcp.id);
              if (favRes.data?.isFavorited) {
                newFavorited.push(mcp.id);
              }
            } catch {}
          }
        }
        setFavoritedIds(newFavorited);
      }
    } catch (err) {
      console.error('获取 MCP 服务器失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getMcpCategories();
      if (res.code === 200) {
        setCategories(['全部', ...(res.data || [])]);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  const handleToggleFavorite = async (mcp: McpServer, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!mcp.id || favoritingIds.includes(mcp.id)) return;

    // 检查是否登录
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录后再收藏');
      window.location.href = '/login';
      return;
    }

    try {
      setFavoritingIds(prev => [...prev, mcp.id!]);
      if (favoritedIds.includes(mcp.id)) {
        await removeFavorite('mcp', mcp.id);
        setFavoritedIds(prev => prev.filter(id => id !== mcp.id));
      } else {
        await addFavorite('mcp', mcp.id);
        setFavoritedIds(prev => [...prev, mcp.id!]);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('请先登录后再收藏');
        window.location.href = '/login';
      } else {
        console.error('收藏操作失败:', err);
      }
    } finally {
      setFavoritingIds(prev => prev.filter(id => id !== mcp.id));
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMcpServers();
  }, [category, type, search]);

  return (
    <div>
      {/* 搜索和筛选 */}
      <div className="mb-6 space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="搜索 MCP 服务器..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
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
            <option value="all">全部</option>
            <option value="local">本地 MCP</option>
            <option value="remote">远程 MCP</option>
          </select>
        </div>
      </div>

      {/* 结果统计 */}
      <div className="text-sm text-gray-500 mb-4">
        {loading ? '加载中...' : `共 ${mcpServers.length} 个 MCP 服务器`}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : mcpServers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          没有找到相关 MCP 服务器
        </div>
      ) : (
        <div className="space-y-3">
          {mcpServers.map(item => (
            <div key={item.id} className="ai-card">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2">
                    <Link href={`/mcp/${item.slug}`} className="font-semibold text-gray-800 hover:text-blue-600 text-sm sm:text-base">
                      {item.name}
                    </Link>
                    <span className="tag tag-primary text-xs">{item.category}</span>
                    <span className={`tag text-xs ${item.type === 'local' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'}`}>
                      {typeLabels[item.type] || item.type}
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
                <button
                  onClick={(e) => handleToggleFavorite(item, e)}
                  disabled={favoritingIds.includes(item.id!)}
                  className={`text-sm self-start sm:ml-2 ${favoritedIds.includes(item.id!) ? 'text-yellow-500' : 'text-gray-400 hover:text-blue-600'}`}
                >
                  {favoritedIds.includes(item.id!) ? '★' : '☆'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
