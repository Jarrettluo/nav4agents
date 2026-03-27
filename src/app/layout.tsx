import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Nav4Agent - Agent 导航",
  description: "发现、收藏优质 AI Agent 工具、MCP 服务器和订阅服务",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>
        {/* 顶部导航 */}
        <header className="bg-white border-b border-gray-200">
          <div className="container">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-bold text-gray-800">Nav4Agent</span>
                <span className="text-sm text-gray-500">Agent 导航</span>
              </Link>
              
              {/* 导航链接 - 桌面端 */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/mcp" className="text-sm text-gray-600 hover:text-blue-600">
                  MCP 服务器
                </Link>
                <Link href="/skills" className="text-sm text-gray-600 hover:text-blue-600">
                  AI Skills
                </Link>
                <Link href="/subscriptions" className="text-sm text-gray-600 hover:text-blue-600">
                  订阅方案
                </Link>
              </nav>
              
              {/* 搜索框 */}
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索工具..."
                  className="search-input pl-9"
                />
              </div>
            </div>
          </div>
        </header>
        
        {/* 移动端底部导航 */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
          <div className="flex justify-around h-12">
            <Link href="/" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">首页</span>
            </Link>
            <Link href="/mcp" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">MCP</span>
            </Link>
            <Link href="/skills" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">Skills</span>
            </Link>
            <Link href="/subscriptions" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">订阅</span>
            </Link>
          </div>
        </nav>
        
        {/* 主内容区 */}
        <main className="container py-4 pb-20 md:pb-4">
          {children}
        </main>
        
        {/* 页脚 */}
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="container text-center text-xs text-gray-500">
            <p>© 2026 Nav4Agent · 发现好用的 Agent 工具</p>
          </div>
        </footer>
      </body>
    </html>
  );
}