import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "./Header";
import ContentWrapper from "./ContentWrapper";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";
import { SITE_URL, SITE_NAME, SITE_SLOGAN, SITE_DESC, ogImage } from "@/lib/seo";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} - 中文开发者的 AI 工具选型站`,
    template: `%s | ${SITE_NAME}`,
  },
  description: `${SITE_SLOGAN}。${SITE_DESC}`,
  keywords: ["MCP", "MCP 服务器", "AI Skills", "Agent 工具", "Cursor", "Claude Code", "中文", "AI 工具导航"],
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Nav4Agent",
  },
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: `${SITE_NAME} - 中文开发者的 AI 工具选型站`,
    description: `${SITE_SLOGAN}。${SITE_DESC}`,
    images: [
      {
        url: ogImage.site,
        width: 1200,
        height: 630,
        type: "image/jpeg",
        alt: `${SITE_NAME} - ${SITE_SLOGAN}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - 中文开发者的 AI 工具选型站`,
    description: `${SITE_SLOGAN}。${SITE_DESC}`,
    images: [ogImage.site],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Nav4Agent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1456f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="manifest" href="/manifest.json" />
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
        <main className="min-h-screen pb-20 md:pb-4">
          <ContentWrapper>{children}</ContentWrapper>
        </main>
        <footer className="bg-white border-t border-gray-200 py-4 mt-8">
          <div className="container text-center text-xs text-gray-500">
            <p>© 2026 Nav4Agent · {SITE_SLOGAN} · <a href="https://beian.miit.gov.cn/#/Integrated/index" target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">蜀ICP备2021021531号-3</a></p>
          </div>
        </footer>
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}