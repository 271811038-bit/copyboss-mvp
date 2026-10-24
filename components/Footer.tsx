// 全站页脚：合规链接 + 客服支持邮箱
// Creem 审核要求：隐私政策、服务条款、客服邮箱必须在公开页面可见

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-black/10 dark:border-white/15 bg-white dark:bg-black">
      <div className="mx-auto max-w-4xl px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500 dark:text-zinc-400">
        <div>© {new Date().getFullYear()} CopyBoss · Your AI copywriter</div>
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          <Link href="/privacy" className="hover:text-black dark:hover:text-zinc-50">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-black dark:hover:text-zinc-50">
            Terms of Service
          </Link>
          <Link href="/acceptable-use" className="hover:text-black dark:hover:text-zinc-50">
            Acceptable Use
          </Link>
          <a
            href="mailto:271811038@qq.com"
            className="hover:text-black dark:hover:text-zinc-50"
          >
            Support: 271811038@qq.com
          </a>
        </div>
      </div>
    </footer>
  );
}
