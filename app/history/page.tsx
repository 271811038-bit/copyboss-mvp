// 注意：没有 "use client" —— 数据在服务器上读好再发给浏览器（更快、更安全）
// 这个页面读的是数据库里你真真实实生成过的文案

import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import CopyCard from "@/components/CopyCard";

// 缓存配置：每次请求都跑（数据库内容随时在变，不要缓存）
export const dynamic = "force-dynamic";

// 这两段不能放到组件外（需要 JSX）：保持组件内
function TabLink({ href, 选中, children }: { href: string; 选中: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={
        选中
          ? "rounded-full bg-black px-4 py-1.5 text-xs text-white dark:bg-white dark:text-black"
          : "rounded-full border border-black/15 px-4 py-1.5 text-xs text-zinc-600 transition-colors hover:border-black/40 dark:border-white/20 dark:text-zinc-400 dark:hover:border-white/40"
      }
    >
      {children}
    </Link>
  );
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // 验明身份
  const 会话 = await auth();

  // 从 URL 读筛选条件（?filter=fav 或不传=全部）
  const { filter } = await searchParams;
  const 仅收藏 = filter === "fav";

  // 读数据库：根据筛选条件决定是否加 isFavorite:true
  const 历史 = await prisma.copy.findMany({
    where: {
      userId: 会话?.user?.id ?? "",
      ...(仅收藏 ? { isFavorite: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // 统计：用了 Prisma aggregate 一次走完（比前端再查一遍强）
  const 统计 = await prisma.copy.groupBy({
    by: ["isFavorite"],
    where: { userId: 会话?.user?.id ?? "" },
    _count: { _all: true },
  });
  const 全部数 = 统计.reduce((累, 条) => 累 + 条._count._all, 0);
  const 收藏数 = 统计.find((条) => 条.isFavorite)?._count._all ?? 0;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 标题 */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          历史文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          你的文案都存在数据库里，关机也不会丢。
        </p>
      </div>

      {/* 筛选 Tab：点击切换，URL 改变会触发本页重新拉数据 */}
      <div className="mb-6 flex items-center gap-2">
        <TabLink href="/history" 选中={!仅收藏}>
          全部 {全部数}
        </TabLink>
        <TabLink href="/history?filter=fav" 选中={仅收藏}>
          ❤️ 仅收藏 {收藏数}
        </TabLink>
      </div>

      {/* 列表 */}
      {历史.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
          <p>{仅收藏 ? "还没有收藏的文案。" : "还没有历史。"}</p>
          <Link href="/generate" className="text-black underline dark:text-zinc-200">
            去生成第一条 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* 把日期转 ISO 字符串传给客户端组件（Date 对象不能跨服务端/客户端边界传） */}
          {历史.map((条) => (
            <CopyCard
              key={条.id}
              条={{
                id: 条.id,
                platform: 条.platform,
                style: 条.style,
                content: 条.content,
                isFavorite: 条.isFavorite,
                createdAt: 条.createdAt.toISOString(),
              }}
            />
          ))}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        {仅收藏 ? `收藏 ${历史.length} 条` : `共 ${历史.length} 条`} · 点 ❤️ 收藏，点 📋 复制全文
      </p>
    </main>
  );
}