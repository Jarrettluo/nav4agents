'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';
import { addFavorite, removeFavorite, checkFavorite } from '@/lib/data/favorites';
import type { FavoriteType } from '@/lib/data/types';

export default function FavoriteButton({
  type,
  itemId,
  size = 'sm',
}: {
  type: FavoriteType;
  itemId: number;
  size?: 'sm' | 'md';
}) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriting, setFavoriting] = useState(false);

  useEffect(() => {
    checkFavorite(type, itemId)
      .then((res) => setIsFavorited(res.data?.isFavorited || false))
      .catch(() => {});
  }, [type, itemId]);

  const handleToggle = async () => {
    try {
      setFavoriting(true);
      if (isFavorited) {
        await removeFavorite(type, itemId);
        setIsFavorited(false);
      } else {
        await addFavorite(type, itemId);
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('收藏操作失败:', err);
    } finally {
      setFavoriting(false);
    }
  };

  const cls =
    size === 'md'
      ? 'flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm transition-colors self-start'
      : 'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-colors';

  return (
    <button
      onClick={handleToggle}
      disabled={favoriting}
      className={`${cls} flex-shrink-0 whitespace-nowrap ${isFavorited ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
    >
      <Star className={`w-3.5 h-3.5 ${isFavorited ? 'fill-current' : ''}`} />
      {isFavorited ? '已收藏' : '收藏'}
    </button>
  );
}