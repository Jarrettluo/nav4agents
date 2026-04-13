'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, LogOut, Loader2 } from 'lucide-react';

interface UserInfo {
  userId: number;
  username: string;
  email: string;
  avatar?: string;
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const isActive = (path: string) => {
    if (path === '/' && pathname === '/') return true;
    if (path !== '/' && pathname.startsWith(path)) return false; // fix: more specific matching
    if (path === '/mcp' && pathname.startsWith('/mcp')) return true;
    if (path === '/skills' && pathname.startsWith('/skills')) return true;
    if (path === '/subscriptions' && pathname.startsWith('/subscriptions')) return true;
    if (path === '/codingplan' && pathname.startsWith('/codingplan')) return true;
    if (path === '/favorites' && pathname.startsWith('/favorites')) return true;
    if (path === '/login' && pathname.startsWith('/login')) return true;
    return false;
  };

  // 检查登录状态
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };
    checkAuth();
    // 监听存储变化
    window.addEventListener('storage', checkAuth);
    return () => window.removeEventListener('storage', checkAuth);
  }, [pathname]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/');
  }, [router]);

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
            <span className="text-xs sm:text-sm text-gray-500 hidden lg:inline">AI Agent Skill MCP发现和分享</span>
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
            {/* 用户区域 */}
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : user ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/favorites"
                  className={`p-2 rounded-lg transition-colors ${
                    pathname === '/favorites'
                      ? 'bg-black/5 text-blue-600'
                      : 'text-gray-600 hover:bg-black/5'
                  }`}
                  title="我的收藏"
                >
                  <span className="text-lg">★</span>
                </Link>
                <div className="relative group">
                  <button className="flex items-center gap-1.5 p-1.5 rounded-lg hover:bg-black/5 transition-colors">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.username} className="w-7 h-7 rounded-full object-cover" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </button>
                  {/* 下拉菜单 */}
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      href="/favorites"
                      className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      我的收藏
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <User className="w-4 h-4" />
                <span>登录</span>
              </Link>
            )}

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
            {/* 移动端导航 */}
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
