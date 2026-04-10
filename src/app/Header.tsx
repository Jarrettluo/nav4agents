"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [searchValue, setSearchValue] = useState("");
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-semibold text-gray-800 font-outfit">Nav4Agent</span>
            <span className="text-sm text-gray-500">Agent 导航</span>
          </Link>

          {/* 导航链接 - 桌面端 */}
          <nav className="hidden md:flex items-center gap-2">
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
              订阅方案
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
