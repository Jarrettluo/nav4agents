import Link from "next/link";
import { mcpResources } from "@/data/mcp";
import { skills } from "@/data/skills";
import { subscriptions } from "@/data/subscriptions";

export default function Home() {
  const featuredMcp = mcpResources.filter(m => m.featured).slice(0, 4);
  const featuredSkill = skills.filter(s => s.featured).slice(0, 4);
  const freeSubscriptions = subscriptions.filter(s => s.price === 0).slice(0, 3);

  return (
    <div>
      {/* 分类导航 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {['开发工具', '效率工具', 'AI 增强', '内容处理', '数据处理', '垂直行业'].map((cat) => (
            <Link
              key={cat}
              href={`/mcp?category=${cat}`}
              className="tag hover:bg-blue-50 hover:text-blue-600"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* 精选 MCP */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">精选 MCP 服务器</h2>
          <Link href="/mcp" className="text-sm text-blue-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featuredMcp.map((item) => (
            <Link key={item.id} href={`/mcp/${item.slug}`} className="card block">
              <div className="flex items-start justify-between mb-1">
                <span className="tag tag-primary text-xs">{item.category}</span>
                <span className="text-xs text-gray-400">⭐ {item.stars}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">{item.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 精选 Skills */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">热门 AI Skills</h2>
          <Link href="/skills" className="text-sm text-blue-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featuredSkill.map((item) => (
            <Link key={item.id} href={`/skills/${item.slug}`} className="card block">
              <div className="flex items-start justify-between mb-1">
                <span className="tag tag-primary text-xs">{item.category}</span>
                <span className="text-xs text-gray-400">👤 {item.usage}</span>
              </div>
              <h3 className="text-sm font-medium text-gray-800 mb-1">{item.name}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{item.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 订阅方案 */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-gray-800">订阅方案对比</h2>
          <Link href="/subscriptions" className="text-sm text-blue-600 hover:underline">
            查看全部 →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {freeSubscriptions.map((sub, i) => (
            <Link key={i} href="/subscriptions" className="card flex items-center gap-3">
              <span className="text-2xl">{sub.logo}</span>
              <div>
                <h3 className="text-sm font-medium text-gray-800">{sub.platform}</h3>
                <p className="text-xs text-green-600">免费</p>
              </div>
            </Link>
          ))}
          {subscriptions.filter(s => s.price > 0 && s.price <= 20).slice(0, 3).map((sub, i) => (
            <Link key={i + 10} href="/subscriptions" className="card flex items-center gap-3">
              <span className="text-2xl">{sub.logo}</span>
              <div>
                <h3 className="text-sm font-medium text-gray-800">{sub.platform}</h3>
                <p className="text-xs text-gray-500">${sub.price}/月</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 最近收录 */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">最近收录</h2>
        <div className="space-y-2">
          {[
            { type: 'MCP', name: 'Sequential Thinking', time: '2小时前' },
            { type: 'Skill', name: 'Git Workflow Helper', time: '5小时前' },
            { type: 'MCP', name: 'Postgres MCP', time: '1天前' },
          ].map((item, i) => (
            <div key={i} className="card flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <span className="tag text-xs">{item.type}</span>
                <span className="text-sm text-gray-700">{item.name}</span>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}