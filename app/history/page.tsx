// 注意：没有 "use client" —— 数据在服务器上读好再发给浏览器（更快、更安全）
// 这个页面读的是数据库里你真真实实生成过的文案

import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { 查额度 } from "@/lib/limits";
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

// 仪表板单卡片（emoji + 数字 + 标签）
function StatCard({
  emoji,
  label,
  value,
  sub,
  highlight,
}: {
  emoji: string;
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight
          ? "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950"
          : "border-black/10 bg-white dark:border-white/15 dark:bg-zinc-900"
      }`}
    >
      <div className="mb-1 text-xl">{emoji}</div>
      <div className="text-2xl font-semibold tracking-tight text-black dark:text-zinc-50">
        {value}
      </div>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
      {sub && (
        <div className="mt-1 text-[10px] text-zinc-400 dark:text-zinc-500">{sub}</div>
      )}
    </div>
  );
}

// 时间分段工具：把"今天 0 点"和"本周一 0 点"算出来，供后面按段分组用
function 时间分界点() {
  const 现在 = new Date();
  const 北京字符串 = 现在.toLocaleString("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [日期] = 北京字符串.split(" ");
  const 今日零点 = new Date(`${日期}T00:00:00+08:00`);

  // 本周一 0 点（周一=1、周日=0）：倒退到周一
  // 注意 new Date().getDay() 北京时间可能不准，要用 toLocaleString 拿北京是周几
  const 北京星期几 = parseInt(
    现在.toLocaleString("en-US", { timeZone: "Asia/Shanghai", weekday: "short" }).match(
      /\d+/
    )?.[0] ?? "1"
  );
  // en-US weekday short = "Sun" "Mon" 等，但 JS getDay() 0=Sun，用映射更稳
  const 星期映射: Record<string, number> = {
    Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6,
  };
  const 星期名 = 现在.toLocaleString("en-US", {
    timeZone: "Asia/Shanghai",
    weekday: "short",
  });
  const 今天周几 = 星期映射[星期名] ?? 1;
  // 倒退天数：周一=0 倒退 0 天，周二=1 倒退 1 天，...周日=6 倒退 6 天
  const 倒退天数 = 今天周几 === 0 ? 6 : 今天周几 - 1;
  const 本周一零点 = new Date(今日零点.getTime() - 倒退天数 * 24 * 60 * 60 * 1000);

  return { 今日零点, 本周一零点 };
}

// 把文案按时间段分组（今日/本周/更早）
function 按日期分组<T extends { createdAt: Date }>(
  文案们: T[],
  分界: { 今日零点: Date; 本周一零点: Date }
) {
  const 今日: T[] = [];
  const 本周: T[] = [];
  const 更早: T[] = [];
  for (const 条 of 文案们) {
    if (条.createdAt >= 分界.今日零点) {
      今日.push(条);
    } else if (条.createdAt >= 分界.本周一零点) {
      本周.push(条);
    } else {
      更早.push(条);
    }
  }
  return { 今日, 本周, 更早 };
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  // 验明身份
  const 会话 = await auth();
  const 用户ID = 会话?.user?.id ?? "";

  // 从 URL 读筛选条件（?filter=fav 或不传=全部）
  const { filter } = await searchParams;
  const 仅收藏 = filter === "fav";

  // 读数据库：根据筛选条件决定是否加 isFavorite:true
  const 历史 = await prisma.copy.findMany({
    where: {
      userId: 用户ID,
      ...(仅收藏 ? { isFavorite: true } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200, // 取够多让分组有内容（peng 143 条 + 之后还会涨）
  });

  // === 仪表板统计（4 项）===
  // ① 总文案数（不限筛选，全局）
  const 总数 = await prisma.copy.count({ where: { userId: 用户ID } });
  // ② 已收藏数（全局）
  const 收藏数 = await prisma.copy.count({ where: { userId: 用户ID, isFavorite: true } });
  // ③ 今日额度（复用 lib/limits.ts，自动按用户 plan 算上限）
  const 额度 = await 查额度(用户ID);
  // ④ 最爱平台：按 platform 分组计数，取最多那条
  const 平台分组 = await prisma.copy.groupBy({
    by: ["platform"],
    where: { userId: 用户ID },
    _count: { _all: true },
    orderBy: { _count: { platform: "desc" } },
    take: 1,
  });
  const 最爱平台 = 平台分组[0];

  // === 按日期分段 ===
  const 分界 = 时间分界点();
  const 分组 = 按日期分组(历史, 分界);

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

      {/* 仪表板（4 项统计卡片） */}
      <section className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard emoji="📝" label="总文案" value={总数} />
        <StatCard
          emoji="🎁"
          label="今日额度"
          value={`${额度.已用} / ${额度.总数}`}
          sub={
            额度.超额
              ? "明天重置"
              : "剩 " + 额度.剩余 + " 次" + (额度.plan === "PRO" ? " · Pro" : "")
          }
          highlight={额度.超额}
        />
        <StatCard emoji="❤️" label="已收藏" value={收藏数} />
        <StatCard
          emoji="🏆"
          label="最爱平台"
          value={最爱平台?.platform ?? "—"}
          sub={最爱平台 ? `${最爱平台._count._all} 条` : "暂无数据"}
        />
      </section>

      {/* 筛选 Tab */}
      <div className="mb-6 flex items-center gap-2">
        <TabLink href="/history" 选中={!仅收藏}>
          全部 {总数}
        </TabLink>
        <TabLink href="/history?filter=fav" 选中={仅收藏}>
          ❤️ 仅收藏 {收藏数}
        </TabLink>
      </div>

      {/* 列表（按日期分组） */}
      {历史.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
          <p>{仅收藏 ? "还没有收藏的文案。" : "还没有历史。"}</p>
          <Link href="/generate" className="text-black underline dark:text-zinc-200">
            去生成第一条 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* 今日 */}
          {分组.今日.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-baseline gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <span>📅 今天</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {分组.今日.length} 条
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {分组.今日.map((条) => (
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
            </section>
          )}

          {/* 本周 */}
          {分组.本周.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-baseline gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <span>🗓️ 本周</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {分组.本周.length} 条
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {分组.本周.map((条) => (
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
            </section>
          )}

          {/* 更早 */}
          {分组.更早.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-baseline gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
                <span>📦 更早</span>
                <span className="text-xs text-zinc-400 dark:text-zinc-500">
                  {分组.更早.length} 条
                </span>
              </h2>
              <div className="flex flex-col gap-3">
                {分组.更早.map((条) => (
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
            </section>
          )}
        </div>
      )}

      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        {仅收藏 ? `收藏 ${历史.length} 条` : `共 ${历史.length} 条`} · 最多展示 200 条
      </p>
    </main>
  );
}
