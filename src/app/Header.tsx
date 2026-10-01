'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Star } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const navLinks = [
    { href: '/mcp', label: 'MCP 服务器' },
    { href: '/skills', label: 'AI Skills' },
    { href: '/subscriptions', label: '智能体工具' },
    { href: '/codingplan', label: 'Coding Plan' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl font-semibold text-gray-800 font-outfit">Nav4Agents</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden lg:inline">中文开发者的 AI 工具选型站</span>
          </Link>

          {/* 导航链接 - 桌面端 - 居中 */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-all ${
                  pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                    ? 'bg-black/5 text-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-black/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* 右侧功能区 */}
          <div className="flex items-center gap-2">
            <Link
              href="/favorites"
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                pathname === '/favorites'
                  ? 'bg-black/5 text-blue-600'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-black/5'
              }`}
              title="我的收藏（保存在本地浏览器）"
            >
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">收藏</span>
            </Link>

            {/* 移动端菜单按钮 */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-600 hover:bg-black/5 rounded-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {showMobileMenu && (
          <div className="md:hidden py-3 border-t border-gray-100">
            <nav className="space-y-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setShowMobileMenu(false)}
                  className={`block px-3 py-2 text-sm font-medium rounded-lg ${
                    pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href))
                      ? 'bg-black/5 text-blue-600'
                      : 'text-gray-600 hover:bg-black/5'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/favorites"
                onClick={() => setShowMobileMenu(false)}
                className="block px-3 py-2 text-sm font-medium rounded-lg text-gray-600 hover:bg-black/5"
              >
                我的收藏
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}