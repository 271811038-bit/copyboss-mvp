// 全局导航栏
// 客户端组件：根据登录态显示不同 UI
//   未登录 → 显示 "登录 / 注册" 按钮
//   已登录 → 显示 "用户名 + 登出"

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const 链接 = [
  { href: "/", label: "首页" },
  { href: "/generate", label: "生成文案" },
  { href: "/history", label: "历史文案" },
  { href: "/pricing", label: "升级 Pro 👑" },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="w-full border-b border-black/10 dark:border-white/15 bg-white/80 dark:bg-black/80 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-semibold text-lg">
          CopyBoss
        </Link>

        <div className="flex items-center gap-6 text-sm">
          {链接.map((项) => {
            const 当前 = pathname === 项.href;
            return (
              <Link
                key={项.href}
                href={项.href}
                className={
                  当前
                    ? "text-black dark:text-zinc-50 font-medium"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-50"
                }
              >
                {项.label}
              </Link>
            );
          })}

          {/* 登录态分支 */}
          <div className="ml-2 border-l border-black/10 dark:border-white/15 pl-6">
            {status === "loading" ? (
              <span className="text-zinc-400 text-sm">…</span>
            ) : session?.user ? (
              <div className="flex items-center gap-3">
                <span className="text-zinc-600 dark:text-zinc-300">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-zinc-500 hover:text-black dark:hover:text-zinc-50"
                >
                  登出
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-zinc-500 hover:text-black dark:hover:text-zinc-50"
                >
                  登录
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-black dark:bg-white px-3 py-1 text-white dark:text-black text-sm hover:bg-zinc-800 dark:hover:bg-zinc-200"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}