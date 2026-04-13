'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { getHomeData } from '@/lib/api/home';
import { getSubscriptions } from '@/lib/api/subscriptions';
import type { HomeData, Subscription } from '@/lib/api/types';

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [homeData, setHomeData] = useState<HomeData | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [homeRes, subRes] = await Promise.all([
          getHomeData(),
          getSubscriptions({ pageSize: 6 }),
        ]);
        if (homeRes.code === 200) {
          setHomeData(homeRes.data);
        }
        if (subRes.code === 200) {
          setSubscriptions(subRes.data.list || []);
        }
      } catch (err) {
        console.error('获取数据失败:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const featuredMcp = homeData?.featuredMcp || [];
  const featuredSkills = homeData?.featuredSkills || [];
  const recentItems = homeData?.recentItems || [];

  const freeSubscriptions = subscriptions.filter(s => s.price === 0);
  const paidSubscriptions = subscriptions.filter(s => s.price > 0 && s.price <= 20);

  return (
    <>
      {/* Hero Banner - 全宽独立布局，贴近 header */}
      <section className="relative overflow-hidden" style={{ marginTop: '-1px' }}>
        {/* 顶部装饰线 - 品牌渐变 */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500" />

        <div className="bg-white py-10 md:py-20">
          <div className="max-w-[1200px] mx-auto px-4 md:px-8 lg:px-12">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 lg:gap-12">
              {/* 左侧文案 */}
              <div className="flex-1 max-w-3xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-semibold text-gray-800 mb-4 md:mb-6 font-outfit leading-tight" style={{ fontWeight: 500, lineHeight: 1.1 }}>
                  让 AI 真正成为你的生产力
                </h1>
                <p className="text-base md:text-lg lg:text-xl text-gray-500 mb-6 md:mb-10 max-w-2xl" style={{ lineHeight: 1.5 }}>
                  汇聚最优秀的 AI Agent、MCP 服务器与智能工具，一站式发现、对比与使用
                </p>

                {/* 功能标签 - Pill 样式 */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 mb-6 md:mb-10">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm">
                    <span>🔌</span>
                    <span className="font-medium text-gray-700">MCP 生态</span>
                    <span className="text-gray-400 hidden sm:inline">快速接入 100+</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm">
                    <span>🧠</span>
                    <span className="font-medium text-gray-700">AI Skills</span>
                    <span className="text-gray-400 hidden sm:inline">发现强大 AI</span>
                  </div>
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full px-4 py-2 text-sm">
                    <span>⚡</span>
                    <span className="font-medium text-gray-700">智能工具</span>
                    <span className="text-gray-400 hidden sm:inline">探索 Agent</span>
                  </div>
                </div>

                {/* CTA 按钮 - Pill 样式 */}
                <div className="flex flex-wrap gap-4">
                  <Link
                    href="/mcp"
                    className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors"
                    style={{ fontSize: '14px' }}
                  >
                    开始探索
                    <span>→</span>
                  </Link>
                  <Link
                    href="#features"
                    className="inline-flex items-center gap-2 text-gray-600 px-6 py-3 rounded-full font-medium hover:text-gray-900 transition-colors"
                    style={{ fontSize: '14px' }}
                  >
                    了解更多
                  </Link>
                </div>
              </div>

              {/* 右侧留白 - 简洁优雅 */}
              <div className="hidden lg:block w-80" />
            </div>
          </div>
        </div>

        {/* 底部装饰线 */}
        <div className="h-px bg-gray-100" />
      </section>

      {/* Banner 以下内容 - 最大 1200px 居中 */}
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        {/* 分类导航 */}
        <div className="mb-6" id="features">
          <div className="flex flex-wrap gap-2">
            {['开发工具', '效率工具', 'AI 增强', '内容处理', '数据处理', '垂直行业'].map((cat) => (
              <Link
                key={cat}
                href={`/mcp?category=${cat}`}
                className="tag hover:bg-blue-50 hover:text-blue-600 transition-colors"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        {/* 精选 MCP */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 font-outfit">精选 MCP 服务器</h2>
            <Link href="/mcp" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {featuredMcp.map((item) => (
              <Link key={item.id} href={`/mcp/${item.slug}`} className="card block">
                <div className="flex items-start justify-between mb-2">
                  <span className="tag tag-primary text-xs">{item.category}</span>
                  <span className="text-xs text-gray-400">⭐ {item.stars}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 精选 Skills */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 font-outfit">热门 AI Skills</h2>
            <Link href="/skills" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {featuredSkills.map((item) => (
              <Link key={item.id} href={`/skills/${item.slug}`} className="card block">
                <div className="flex items-start justify-between mb-2">
                  <span className="tag tag-primary text-xs">{item.category}</span>
                  <span className="text-xs text-gray-400">👤 {item.usage}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{item.name}</h3>
                <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* 订阅方案 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 font-outfit">智能体工具对比</h2>
            <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
              查看全部 →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {freeSubscriptions.map((sub) => (
              <Link key={sub.id} href="/subscriptions" className="card flex items-center gap-3">
                <span className="text-2xl">{sub.logo}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{sub.platform}</h3>
                  <p className="text-xs text-green-600">免费</p>
                </div>
              </Link>
            ))}
            {paidSubscriptions.slice(0, Math.max(0, 3 - freeSubscriptions.length)).map((sub) => (
              <Link key={sub.id} href="/subscriptions" className="card flex items-center gap-3">
                <span className="text-2xl">{sub.logo}</span>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">{sub.platform}</h3>
                  <p className="text-xs text-gray-500">${sub.price}/月</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 最近收录 */}
        <section>
          <h2 className="text-lg font-semibold text-gray-800 mb-3 font-outfit">最近收录</h2>
          <div className="space-y-2">
            {recentItems.length > 0 ? recentItems.map((item, i) => (
              <div key={i} className="ai-card flex items-center justify-between py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="tag text-xs">{item.type}</span>
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
                <span className="text-xs text-gray-400">{item.time}</span>
              </div>
            )) : (
              <>
                <div className="ai-card flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="tag text-xs">MCP</span>
                    <span className="text-sm text-gray-700">Sequential Thinking</span>
                  </div>
                  <span className="text-xs text-gray-400">2小时前</span>
                </div>
                <div className="ai-card flex items-center justify-between py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="tag text-xs">Skill</span>
                    <span className="text-sm text-gray-700">Git Workflow Helper</span>
                  </div>
                  <span className="text-xs text-gray-400">5小时前</span>
                </div>
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
