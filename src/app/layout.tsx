import type { Metadata } from "next";
import "./globals.css";
import Header from "./Header";

export const metadata: Metadata = {
  title: "Nav4Agent - Agent 导航",
  description: "发现、收藏优质 AI Agent 工具、MCP 服务器和订阅服务",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Outfit:wght@400;500;600&family=Poppins:wght@400;500;600&family=Roboto:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Header />
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
          <div className="flex justify-around h-12">
            <a href="/" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">首页</span>
            </a>
            <a href="/mcp" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">MCP</span>
            </a>
            <a href="/skills" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">Skills</span>
            </a>
            <a href="/subscriptions" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">订阅</span>
            </a>
            <a href="/codingplan" className="flex flex-col items-center justify-center flex-1 py-1">
              <span className="text-xs">对比</span>
            </a>
          </div>
        </nav>
        <main className="container pt-6 pb-20 md:pt-6 md:pb-4">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="container text-center text-xs text-gray-500">
            <p>© 2026 Nav4Agent · 发现好用的 Agent 工具 · <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">蜀ICP备2021021531号-3</a></p>
          </div>
        </footer>
      </body>
    </html>
  );
}
