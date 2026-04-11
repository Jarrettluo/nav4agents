"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
// import { X } from "lucide-react"; // 搜索功能暂时禁用
// import { useState } from "react";

export default function Header() {
  // const [searchValue, setSearchValue] = useState(""); // 搜索功能暂时禁用
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 sm:gap-2">
            <span className="text-lg sm:text-xl font-semibold text-gray-800 font-outfit">Nav4Agents</span>
            <span className="text-xs sm:text-sm text-gray-500 hidden sm:inline">AI Agent Skill MCP发现和分享</span>
          </Link>

          {/* 导航链接 - 桌面端 - 居中 */}
          <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2">
            <Link
              href="/mcp"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive("/mcp")
                  ? "bg-black/5 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-black/5"
              }`}
            >
              MCP 服务器
            </Link>
            <Link
              href="/skills"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive("/skills")
                  ? "bg-black/5 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-black/5"
              }`}
            >
              AI Skills
            </Link>
            <Link
              href="/subscriptions"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive("/subscriptions")
                  ? "bg-black/5 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-black/5"
              }`}
            >
              智能体工具
            </Link>
            <Link
              href="/codingplan"
              className={`px-4 py-2 text-sm font-medium rounded-full transition-all ${
                isActive("/codingplan")
                  ? "bg-black/5 text-blue-600"
                  : "text-gray-600 hover:text-blue-600 hover:bg-black/5"
              }`}
            >
              Coding Plan
            </Link>
          </nav>

          {/* 搜索框 - 暂时禁用，等待后台服务 */}
          {/* <div className="hidden md:block relative w-64">
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input w-full"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div> */}
          {/* 右侧占位 - 保持布局平衡 */}
          <div className="hidden md:block w-64" />
        </div>
      </div>
    </header>
  );
}
