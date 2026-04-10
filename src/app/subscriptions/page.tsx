import Link from "next/link";
import { subscriptions, categories } from "@/data/subscriptions";
import { ExternalLink, Check } from "lucide-react";

export default function SubscriptionsPage() {
  return (
    <div>
      {/* 分类 */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/subscriptions?type=${cat}`}
              className="tag hover:bg-blue-50 hover:text-blue-600"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      {/* 订阅列表 - 按分类 */}
      {categories.filter(c => c !== '全部').map((category) => {
        const items = subscriptions.filter(s => s.category === category);
        if (items.length === 0) return null;
        return (
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
        );
      })}
    </div>
  );
}