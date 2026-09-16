import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CopyBoss — 你的 AI 文案优化师",
  description: "30 秒为同一主题生成小红书、公众号、抖音文案。",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* 导航栏：写在 layout 里，所有页面自动都有 */}
        <nav className="flex items-center justify-between border-b border-black/10 px-6 py-4 dark:border-white/15">
          <Link href="/" className="text-base font-semibold text-black dark:text-zinc-50">
            CopyBoss
          </Link>
          <div className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
            <Link href="/generate" className="hover:text-black dark:hover:text-zinc-50">
              生成文案
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
