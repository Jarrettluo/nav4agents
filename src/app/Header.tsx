"use client";

import Link from "next/link";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");

  return (
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="搜索工具..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="search-input pl-10 w-full"
            />
            {searchValue && (
              <button
                onClick={() => setSearchValue("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
