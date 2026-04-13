'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ExternalLink, Check, Loader2 } from 'lucide-react';
import { getSubscriptions, getSubscriptionCategories } from '@/lib/api/subscriptions';
import type { Subscription } from '@/lib/api/types';

export default function SubscriptionsPage() {
  const [loading, setLoading] = useState(true);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [filter, setFilter] = useState<string>('all');

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filter !== 'all') params.category = filter;

      const res = await getSubscriptions(params);
      if (res.code === 200) {
        setSubscriptions(res.data.list || []);
      }
    } catch (err) {
      console.error('获取订阅方案失败:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getSubscriptionCategories();
      if (res.code === 200) {
        setCategories(['全部', ...(res.data || [])]);
      }
    } catch (err) {
      console.error('获取分类失败:', err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchSubscriptions();
  }, [filter]);

  // 按分类分组
  const groupedSubscriptions = subscriptions.reduce((acc, sub) => {
    const cat = sub.category || '其他';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(sub);
    return acc;
  }, {} as Record<string, Subscription[]>);

  return (
    <div>
      {/* 分类 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/subscriptions?type=${cat}`}
              onClick={(e) => {
                e.preventDefault();
                setFilter(cat);
              }}
              className={`tag hover:bg-blue-50 hover:text-blue-600 ${
                filter === cat ? 'bg-blue-600 text-white' : ''
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* 订阅列表 - 按分类 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : (
        Object.entries(groupedSubscriptions).map(([category, items]) => (
          <section key={category} className="mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-3 font-outfit">{category}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {items.map((sub) => (
                <div key={sub.id} className="card">
                  <div className="flex items-start gap-3">
                    {/* Logo */}
                    <div className="text-2xl sm:text-3xl">{sub.logo}</div>

                    {/* 内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-1">
                        <h3 className="font-medium text-gray-800 text-sm sm:text-base">{sub.platform}</h3>
                        <span className="tag tag-primary text-xs">{sub.product}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{sub.description}</p>

                      {/* 功能列表 */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {sub.features.slice(0, 3).map((feature, i) => (
                          <span key={i} className="flex items-center gap-1 text-xs text-gray-500">
                            <Check className="w-3 h-3 text-green-500 flex-shrink-0" /> {feature}
                          </span>
                        ))}
                      </div>

                      {/* 价格和链接 */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <span className="text-base sm:text-lg font-semibold text-gray-800">
                            {sub.price === 0 ? '免费' : `$${sub.price}`}
                          </span>
                          <span className="text-xs text-gray-500">
                            /{sub.frequency === 'monthly' ? '月' : sub.frequency === 'yearly' ? '年' : ''}
                          </span>
                          <span className="text-xs text-gray-400 ml-1">({sub.priceUnit})</span>
                        </div>
                        <a
                          href={sub.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary flex items-center justify-center gap-1 text-xs"
                        >
                          访问 <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
