// 全站页脚：合规链接 + 客服支持邮箱
// Creem 审核要求：隐私政策、服务条款、客服邮箱必须在公开页面可见

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/15 bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div>© {new Date().getFullYear()} CopyBoss · 让 AI 成为你的文案优化师</div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="hover:text-black dark:hover:text-zinc-50">
            隐私政策
          </Link>
          <Link href="/terms" className="hover:text-black dark:hover:text-zinc-50">
            服务条款
          </Link>
          <Link href="/acceptable-use" className="hover:text-black dark:hover:text-zinc-50">
            可接受使用政策
          </Link>
          <a
            href="mailto:271811038@qq.com"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            联系客服：271811038@qq.com
          </a>
        </div>
      </div>
    </footer>
  );
}
