'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Star, Loader2, ExternalLink } from 'lucide-react';
import { getFavorites, removeFavorite } from '@/lib/data/favorites';
import { pickZh } from '@/lib/i18n';
import type { FavoriteItem, FavoriteType } from '@/lib/data/types';

export default function FavoritesPage() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites({ type: filter === 'all' ? undefined : filter });
      if (res.code === 200) {
        setFavorites(res.data.list || []);
      }
    } catch (err) {
      console.error('获取收藏失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: FavoriteItem) => {
    if (!confirm('确定要取消收藏吗？')) return;
    try {
      setDeleting(item.itemId);
      await removeFavorite(item.type, item.itemId);
      setFavorites(favorites.filter(f => !(f.itemId === item.itemId && f.type === item.type)));
    } catch (err) {
      console.error('取消收藏失败:', err);
    } finally {
      setDeleting(null);
    }
  };

  const getItemLink = (item: FavoriteItem) => {
    switch (item.type) {
      case 'skill':
        return `/skills/${item.skill?.slug}`;
      case 'mcp':
        return `/mcp/${item.mcp?.slug}`;
      case 'subscription':
        return '/subscriptions';
      default:
        return '#';
    }
  };

  const getItemName = (item: FavoriteItem) => {
    return item.skill?.name || item.mcp?.name || item.subscription?.platform || '';
  };

  const getItemDesc = (item: FavoriteItem) => {
    return item.skill ? pickZh(item.skill.descriptionZh, item.skill.description) : item.mcp ? pickZh(item.mcp.descriptionZh, item.mcp.description) : item.subscription?.description || '';
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">我的收藏</h1>
      <p className="text-xs text-gray-400 mb-6">收藏保存在本地浏览器，清理浏览器数据后会丢失</p>

      {/* 筛选 */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(['all', 'skill', 'mcp', 'subscription'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full transition-all ${
              filter === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '全部' : type === 'skill' ? 'Skills' : type === 'mcp' ? 'MCP' : '订阅'}
          </button>
        ))}
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>暂无收藏内容</p>
          <Link href="/mcp" className="text-blue-600 hover:underline mt-2 inline-block">
            去发现 →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {favorites.map((item) => (
            <div key={`${item.type}-${item.itemId}`} className="ai-card">
              <div className="flex items-center justify-between">
                <Link
                  href={getItemLink(item)}
                  className="flex-1 min-w-0 hover:text-blue-600 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`tag text-xs ${
                      item.type === 'skill' ? 'bg-blue-100 text-blue-700' :
                      item.type === 'mcp' ? 'bg-purple-100 text-purple-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.type === 'skill' ? 'Skill' : item.type === 'mcp' ? 'MCP' : '订阅'}
                    </span>
                    <span className="font-semibold text-gray-800">{getItemName(item)}</span>
                  </div>
                  <p className="text-sm text-gray-600 truncate">{getItemDesc(item)}</p>
                </Link>

                <div className="flex items-center gap-2 ml-4">
                  {item.type !== 'subscription' && (
                    <Link
                      href={getItemLink(item)}
                      className="text-gray-400 hover:text-blue-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                  )}
                  <button
                    onClick={() => handleRemove(item)}
                    disabled={deleting === item.itemId}
                    className="text-gray-400 hover:text-red-500"
                    title="取消收藏"
                  >
                    {deleting === item.itemId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      '☆'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}