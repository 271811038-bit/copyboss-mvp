// 定价页（服务端组件）
// 展示免费版 / Pro 会员对比，Pro 按钮跳 Creem 收银台。
//
// 关键设计：
// 1. Creem 产品/API key 放环境变量（CREEM_API_KEY / CREEM_PRODUCT_ID）
//    没配置时按钮显示"即将上线"，页面不炸 —— 分阶段上线安全垫
// 2. 按钮指向 /api/checkout/creem：服务端创建结账会话时自动带上
//    userId 元数据，付款成功后 webhook 靠它认人（不用猜邮箱）
// 3. 已登录的用户显示自己当前的 plan 状态

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

// 免费版 / Pro 版的功能对比（单一数据源，改价只改这里）
const 对比项 = [
  { 功能: "Daily generations", 免费: "1", Pro: "10" },
  { 功能: "Top-up pack", 免费: "—", Pro: "$1 / 10 generations, instant" },
  { 功能: "Platforms", 免费: "Instagram / TikTok / LinkedIn / X / YouTube", Pro: "Instagram / TikTok / LinkedIn / X / YouTube" },
  { 功能: "Tones", 免费: "All 4", Pro: "All 4" },
  { 功能: "History", 免费: "✅", Pro: "✅" },
  { 功能: "Copy / edit / save", 免费: "✅", Pro: "✅" },
  { 功能: "Early access to new features", 免费: "—", Pro: "✅" },
];

export default async function PricingPage() {
  const 会话 = await auth();

  // 查当前用户的 plan（没登录就当 FREE 处理）
  let plan = "FREE";
  if (会话?.user?.id) {
    const 用户 = await prisma.user.findUnique({
      where: { id: 会话.user.id },
      select: { plan: true },
    });
    plan = 用户?.plan ?? "FREE";
  }

  // 收银台是否就绪（没配 = Creem 产品还没建好，按钮降级）
  const 收银台就绪 = Boolean(process.env.CREEM_API_KEY && process.env.CREEM_PRODUCT_ID);

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 标题 */}
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Choose your plan
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Start free, upgrade when it pays for itself. Cancel anytime.
        </p>
        {plan === "PRO" && (
          <p className="mx-auto mt-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            👑 You're a Pro member
          </p>
        )}
      </div>

      {/* 两张卡片 */}
      <div className="mb-10 grid gap-5 sm:grid-cols-2">
        {/* 免费版 */}
        <div className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">Free</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            For trying things out
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            $0
            <span className="text-base font-normal text-zinc-400"> /mo</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🎁 1 generation per day</li>
            <li>📱 All platforms &amp; tones</li>
            <li>📚 History saved forever</li>
          </ul>
          <div className="mt-6">
            {plan === "FREE" && 会话?.user ? (
              <span className="block w-full rounded-full border border-black/15 py-2.5 text-center text-sm font-medium text-zinc-500 dark:border-white/20 dark:text-zinc-400">
                Current plan
              </span>
            ) : (
              <Link
                href={会话?.user ? "/generate" : "/register"}
                className="block w-full rounded-full border border-black/20 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/25 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
              >
                {会话?.user ? "Start generating" : "Sign up free"}
              </Link>
            )}
          </div>
        </div>

        {/* Pro 版（高亮） */}
        <div className="relative rounded-2xl border-2 border-violet-500/60 bg-gradient-to-b from-violet-50/60 to-white p-6 dark:border-violet-500/50 dark:from-violet-950/30 dark:bg-zinc-900">
          <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Most popular
          </span>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">
            Pro 👑
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            For creators posting every day
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            $9.99
            <span className="text-base font-normal text-zinc-400"> /mo</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Billed monthly · Card / Apple Pay · Cancel anytime
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🚀 10 generations per day</li>
            <li>⛽ Need more? Top-up pack $1 / 10 generations</li>
            <li>⚡ Early access to new features</li>
            <li>🔒 Cancel anytime — no charge next month</li>
          </ul>
          <div className="mt-6">
            {plan === "PRO" ? (
              <div className="flex flex-col gap-2">
                <span className="block w-full rounded-full bg-amber-100 py-2.5 text-center text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  Active · thanks for the support!
                </span>
                <a
                  href="/api/portal/creem"
                  className="block w-full rounded-full border border-black/20 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/25 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
                >
                  Manage subscription (cancel / card / invoices)
                </a>
                <a
                  href="/api/checkout/creem?type=pack"
                  className="block w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
                >
                  ⛽ Top-up · $1 / 10 generations
                </a>
              </div>
            ) : !会话?.user ? (
              <Link
                href="/register"
                className="block w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
              >
                Sign up to upgrade
              </Link>
            ) : 收银台就绪 ? (
              <a
                href="/api/checkout/creem"
                className="block w-full rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90"
              >
                Upgrade Pro · $9.99/mo
              </a>
            ) : (
              <span className="block w-full cursor-not-allowed rounded-full bg-black/10 py-2.5 text-center text-sm font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                Payments coming soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 详细对比表 */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          Full comparison
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              <th className="pb-2 font-medium">Feature</th>
              <th className="pb-2 font-medium">Free</th>
              <th className="pb-2 font-medium">Pro 👑</th>
            </tr>
          </thead>
          <tbody>
            {对比项.map((行) => (
              <tr
                key={行.功能}
                className="border-b border-black/5 last:border-0 dark:border-white/5"
              >
                <td className="py-2.5 text-zinc-700 dark:text-zinc-300">{行.功能}</td>
                <td className="py-2.5 text-zinc-500 dark:text-zinc-400">{行.免费}</td>
                <td className="py-2.5 font-medium text-black dark:text-zinc-100">{行.Pro}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 常见问题 */}
      <section className="mt-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          <strong className="text-black dark:text-zinc-100">How do I cancel?</strong>{" "}
          Log in and click "Manage subscription" on this page — one click in the billing portal and you won't be charged again. Your quota stays active until the end of the billing period.
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">What payment methods are supported?</strong>{" "}
          Card / Apple Pay and more, handled securely by our payment partner (taxes included automatically per region).
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">Invoices?</strong>{" "}
          Contact support after purchase and we'll issue one.
        </p>
      </section>
    </main>
  );
}
