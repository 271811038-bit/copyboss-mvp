// 注意：没有 "use client" —— 数据在服务器上读好再发给浏览器（更快、更安全）
// 从今晚起，这个页面读的是数据库里「你真真实实生成过的文案」

import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export default async function HistoryPage() {
  // 服务端直接验明身份（这个页面被中间件保护着，到这的基本都是登录用户）
  const 会话 = await auth();

  // 从数据库读：当前用户的文案，按时间倒序（新的在前），最多先取 100 条
  const 历史 = await prisma.copy.findMany({
    where: { userId: 会话?.user?.id ?? "" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 标题 */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          历史文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          你生成过的文案都存在数据库里，关机也不会丢。
        </p>
      </div>

      {/* 列表 */}
      {历史.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
          <p>还没有历史。</p>
          <Link href="/generate" className="text-black underline dark:text-zinc-200">
            去生成第一条 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {历史.map((条) => (
            <article
              key={条.id}
              className="rounded-xl border border-black/10 p-4 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                {/* toLocaleString：让时间变成「2026/9/22 20:50:11」这种人话格式 */}
                <span>{条.createdAt.toLocaleString("zh-CN")}</span>
                <div className="flex gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {条.platform}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {条.style}
                  </span>
                </div>
              </div>
              {/* line-clamp-4：超过 4 行折叠显示，列表不至于被长文案撑爆 */}
              <p className="line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-black dark:text-zinc-100">
                {条.content}
              </p>
            </article>
          ))}
        </div>
      )}

      {/* 底部提示 */}
      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        共 {历史.length} 条 · 提示：以后会加「收藏」「复制」「删除」按钮。
      </p>
    </main>
  );
}
