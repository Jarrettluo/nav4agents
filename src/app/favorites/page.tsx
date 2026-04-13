'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Star, Loader2, ExternalLink } from 'lucide-react';
import { getFavorites, removeFavorite } from '@/lib/api/favorites';
import type { FavoriteItem, FavoriteType } from '@/lib/api/types';

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [filter, setFilter] = useState<FavoriteType | 'all'>('all');
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    // 检查是否登录
    const token = localStorage.getItem('token');
    if (!token) {
      alert('请先登录后再查看收藏');
      router.push('/login');
      return;
    }
    fetchFavorites();
  }, [filter, router]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const res = await getFavorites({ type: filter === 'all' ? undefined : filter });
      if (res.code === 200) {
        setFavorites(res.data.list || []);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('请先登录后再查看收藏');
        router.push('/login');
      } else {
        console.error('获取收藏失败:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (item: FavoriteItem) => {
    if (!confirm('确定要取消收藏吗？')) return;
    try {
      setDeleting(item.itemId);
      const res = await removeFavorite(item.type, item.itemId);
      if (res.code === 200) {
        setFavorites(favorites.filter(f => f.itemId !== item.itemId || f.type !== item.type));
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        alert('请先登录后再操作');
        router.push('/login');
      } else {
        console.error('取消收藏失败:', err);
      }
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
    return item.skill?.description || item.mcp?.description || item.subscription?.description || '';
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">我的收藏</h1>

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
