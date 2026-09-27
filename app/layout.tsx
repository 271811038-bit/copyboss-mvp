import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://mtboss.cn"),
  title: {
    default: "CopyBoss — 你的 AI 文案优化师",
    template: "%s · CopyBoss",
  },
  description:
    "CopyBoss 是一款 AI 文案工具：输入一个主题，30 秒同时生成小红书、公众号、抖音三大平台爆款文案。免费试用，每天 5 次。",
  keywords: [
    "AI文案",
    "文案生成",
    "小红书文案",
    "公众号文案",
    "抖音文案",
    "AI写作",
    "文案工具",
    "一键生成文案",
  ],
  openGraph: {
    title: "CopyBoss — 你的 AI 文案优化师",
    description:
      "输入一个主题，30 秒同时生成小红书、公众号、抖音三大平台爆款文案。免费试用。",
    url: "https://mtboss.cn",
    siteName: "CopyBoss",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CopyBoss — 你的 AI 文案优化师",
    description: "输入一个主题，30 秒生成三大平台爆款文案。免费试用。",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Providers 包住整个应用，让 useSession() 在任何组件里都能用 */}
        <Providers>
          <Nav />
          {children}
          <Footer />
          <Analytics />
        </Providers>
      </body>
    </html>
  );
}