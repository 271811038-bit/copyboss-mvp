// 定价页（服务端组件）
// 展示免费版 / Pro 月付 / Pro 包年对比，按钮跳 Creem 收银台。
//
// 关键设计：
// 1. Creem 产品/API key 放环境变量（CREEM_API_KEY / CREEM_PRODUCT_ID / CREEM_YEARLY_PRODUCT_ID）
//    没配置时按钮显示"即将上线"，页面不炸 —— 分阶段上线安全垫
// 2. 按钮指向 /api/checkout/creem：服务端创建结账会话时自动带上
//    userId 元数据，付款成功后 webhook 靠它认人（不用猜邮箱）
// 3. 已登录的用户显示自己当前的 plan 状态；加油包按套餐自动匹配规格

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import Link from "next/link";

export const dynamic = "force-dynamic";

// 三档功能对比（单一数据源，改价只改这里）
const 对比项 = [
  { 功能: "Daily credits (1 credit = 1 platform × 1 tone = 3 copies)", 免费: "1", 月付: "10", 包年: "20" },
  { 功能: "Top-up pack", 免费: "—", 月付: "$1 / 10 gens", 包年: "$1 / 20 gens" },
  { 功能: "Platforms", 免费: "All 5", 月付: "All 5", 包年: "All 5" },
  { 功能: "Tones", 免费: "All 4", 月付: "All 4", 包年: "All 4" },
  { 功能: "History", 免费: "✅", 月付: "✅", 包年: "✅" },
  { 功能: "Early access to new features", 免费: "—", 月付: "✅", 包年: "✅ Priority" },
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
  const 月付就绪 = Boolean(process.env.CREEM_API_KEY && process.env.CREEM_PRODUCT_ID);
  const 包年就绪 = Boolean(process.env.CREEM_API_KEY && process.env.CREEM_YEARLY_PRODUCT_ID);

  // 加油包规格（包年会员 $1/20，月付会员 $1/10）
  const 是包年会员 = plan === "PRO_YEARLY";
  const 加油包规格 = 是包年会员 ? "20" : "10";

  return (
    <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10">
      {/* 标题 */}
      <div className="mb-8 flex flex-col gap-2 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Choose your plan
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Start free, upgrade when it pays for itself. Cancel anytime.
        </p>
        {(plan === "PRO" || plan === "PRO_YEARLY") && (
          <p className="mx-auto mt-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            👑 You're a {plan === "PRO_YEARLY" ? "Pro Yearly" : "Pro"} member
          </p>
        )}
      </div>

      {/* 三张卡片 */}
      <div className="mb-10 grid gap-5 sm:grid-cols-3">
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
            <li>🎁 1 credit / day (3 copies)</li>
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

        {/* Pro 月付 */}
        <div className="relative rounded-2xl border-2 border-violet-500/60 bg-gradient-to-b from-violet-50/60 to-white p-6 dark:border-violet-500/50 dark:from-violet-950/30 dark:bg-zinc-900">
          <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Most popular
          </span>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">
            Pro
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            For creators posting every day
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            $9.99
            <span className="text-base font-normal text-zinc-400"> /mo</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            Billed monthly · Cancel anytime
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🚀 10 credits / day (30 copies)</li>
            <li>⛽ Top-up pack $1 / 10 gens</li>
            <li>⚡ Early access to new features</li>
            <li>🔒 Cancel anytime</li>
          </ul>
          <div className="mt-6">
            {plan === "PRO" ? (
              <div className="flex flex-col gap-2">
                <span className="block w-full rounded-full bg-amber-100 py-2.5 text-center text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                  Current plan
                </span>
                <a
                  href="/api/checkout/creem?type=year"
                  className="block w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
                >
                  ⚡ Switch to Yearly · $99/yr
                </a>
              </div>
            ) : plan === "PRO_YEARLY" ? (
              <span className="block w-full rounded-full border border-black/15 py-2.5 text-center text-sm font-medium text-zinc-500 dark:border-white/20 dark:text-zinc-400">
                You're on Pro Yearly 🎉
              </span>
            ) : !会话?.user ? (
              <Link
                href="/register"
                className="block w-full rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
              >
                Sign up to upgrade
              </Link>
            ) : 月付就绪 ? (
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

        {/* Pro 包年 */}
        <div className="relative rounded-2xl border-2 border-emerald-500/50 bg-gradient-to-b from-emerald-50/60 to-white p-6 dark:border-emerald-500/50 dark:from-emerald-950/30 dark:bg-zinc-900">
          <span className="absolute -top-3 left-6 rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
            Best value · save 17%
          </span>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">
            Pro Yearly
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            For serious content machines
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            $99
            <span className="text-base font-normal text-zinc-400"> /yr</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">
            ≈ $8.25/mo · 2 months free vs monthly
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🚀 20 credits / day (60 copies)</li>
            <li>⛽ Top-up pack $1 / 20 gens</li>
            <li>⚡ Priority early access</li>
            <li>🔒 Cancel anytime</li>
          </ul>
          <div className="mt-6">
            {plan === "PRO_YEARLY" ? (
              <div className="flex flex-col gap-2">
                <span className="block w-full rounded-full bg-emerald-100 py-2.5 text-center text-sm font-medium text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200">
                  Current plan
                </span>
                <a
                  href="/api/portal/creem"
                  className="block w-full rounded-full border border-black/20 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/25 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
                >
                  Manage subscription
                </a>
                <a
                  href="/api/checkout/creem?type=pack"
                  className="block w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
                >
                  ⛽ Top-up · $1 / 20 gens
                </a>
              </div>
            ) : plan === "PRO" ? (
              <span className="block w-full rounded-full border border-black/15 py-2.5 text-center text-xs font-medium text-zinc-500 dark:border-white/20 dark:text-zinc-400">
                Switch from the Pro card →
              </span>
            ) : !会话?.user ? (
              <Link
                href="/register"
                className="block w-full rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
              >
                Sign up to upgrade
              </Link>
            ) : 包年就绪 ? (
              <a
                href="/api/checkout/creem?type=year"
                className="block w-full rounded-full bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:opacity-90"
              >
                Go Yearly · $99/yr
              </a>
            ) : (
              <span className="block w-full cursor-not-allowed rounded-full bg-black/10 py-2.5 text-center text-sm font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                Payments coming soon
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 月付/包年会员的订阅管理与加油包入口 */}
      {(plan === "PRO" || plan === "PRO_YEARLY") && (
        <section className="mb-10 flex flex-col items-center gap-3 rounded-2xl border border-black/10 p-5 text-center dark:border-white/15">
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Need more today? 1 credit = 1 platform × 1 tone (3 copies). Top-up credits never expire and are used automatically once your daily quota runs out.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="/api/checkout/creem?type=pack"
              className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
            >
              ⛽ Top-up · $1 / {加油包规格} gens
            </a>
            <a
              href="/api/portal/creem"
              className="rounded-full border border-black/20 px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/25 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
            >
              Manage subscription (cancel / card / invoices)
            </a>
          </div>
        </section>
      )}

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
              <th className="pb-2 font-medium">Pro</th>
              <th className="pb-2 font-medium">Pro Yearly 👑</th>
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
                <td className="py-2.5 text-zinc-500 dark:text-zinc-400">{行.月付}</td>
                <td className="py-2.5 font-medium text-black dark:text-zinc-100">{行.包年}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* 常见问题 */}
      <section className="mt-8 space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
        <p>
          <strong className="text-black dark:text-zinc-100">How do I cancel?</strong>{" "}
          Log in and click "Manage subscription" — one click in the billing portal and you won't be charged again. Your benefits stay active until the end of the paid period.
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">Do top-up credits expire?</strong>{" "}
          No. Top-up credits stay in your account and are consumed automatically only when your daily quota runs out.
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">Can I switch between monthly and yearly?</strong>{" "}
          Yes — upgrade from monthly to yearly anytime from this page. Contact support for downgrades.
        </p>
      </section>
    </main>
  );
}
