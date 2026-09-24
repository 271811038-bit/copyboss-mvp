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
  { 功能: "每日生成次数", 免费: "5 次", Pro: "30 次" },
  { 功能: "支持平台", 免费: "小红书 / 公众号 / 抖音", Pro: "小红书 / 公众号 / 抖音" },
  { 功能: "文案风格", 免费: "4 种全开放", Pro: "4 种全开放" },
  { 功能: "历史记录保存", 免费: "✅", Pro: "✅" },
  { 功能: "收藏 / 复制 / 编辑", 免费: "✅", Pro: "✅" },
  { 功能: "新功能优先体验", 免费: "—", Pro: "✅" },
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
          选择你的方案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          免费用着顺手再升级，随时可取消。
        </p>
        {plan === "PRO" && (
          <p className="mx-auto mt-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
            👑 你已是 Pro 会员
          </p>
        )}
      </div>

      {/* 两张卡片 */}
      <div className="mb-10 grid gap-5 sm:grid-cols-2">
        {/* 免费版 */}
        <div className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">免费版</h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            适合偶尔发帖的老板
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            ¥0
            <span className="text-base font-normal text-zinc-400"> /月</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🎁 每天 5 次生成</li>
            <li>📱 全平台全风格</li>
            <li>📚 历史记录永久保存</li>
          </ul>
          <div className="mt-6">
            {plan === "FREE" && 会话?.user ? (
              <span className="block w-full rounded-full border border-black/15 py-2.5 text-center text-sm font-medium text-zinc-500 dark:border-white/20 dark:text-zinc-400">
                当前方案
              </span>
            ) : (
              <Link
                href={会话?.user ? "/generate" : "/register"}
                className="block w-full rounded-full border border-black/20 py-2.5 text-center text-sm font-medium text-black transition-colors hover:bg-black hover:text-white dark:border-white/25 dark:text-zinc-100 dark:hover:bg-white dark:hover:text-black"
              >
                {会话?.user ? "去生成文案" : "免费注册"}
              </Link>
            )}
          </div>
        </div>

        {/* Pro 版（高亮） */}
        <div className="relative rounded-2xl border-2 border-black p-6 dark:border-white dark:bg-zinc-900">
          <span className="absolute -top-3 left-6 rounded-full bg-black px-3 py-1 text-xs font-medium text-white dark:bg-white dark:text-black">
            最受欢迎
          </span>
          <h2 className="text-lg font-semibold text-black dark:text-zinc-100">
            Pro 会员 👑
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            适合天天要发内容的生意人
          </p>
          <p className="mt-4 text-4xl font-bold text-black dark:text-zinc-50">
            ¥19.9
            <span className="text-base font-normal text-zinc-400"> /月</span>
          </p>
          <ul className="mt-5 space-y-2.5 text-sm text-zinc-700 dark:text-zinc-300">
            <li>🚀 每天 30 次生成（6 倍额度）</li>
            <li>⚡ 新功能优先体验</li>
            <li>🔒 随时取消，次月不再扣费</li>
          </ul>
          <div className="mt-6">
            {plan === "PRO" ? (
              <span className="block w-full rounded-full bg-amber-100 py-2.5 text-center text-sm font-medium text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                已开通 · 感谢支持
              </span>
            ) : !会话?.user ? (
              <Link
                href="/register"
                className="block w-full rounded-full bg-black py-2.5 text-center text-sm font-medium text-white dark:bg-white dark:text-black"
              >
                注册后升级
              </Link>
            ) : 收银台就绪 ? (
              <a
                href="/api/checkout/creem"
                className="block w-full rounded-full bg-black py-2.5 text-center text-sm font-medium text-white transition-opacity hover:opacity-80 dark:bg-white dark:text-black"
              >
                升级 Pro · ¥19.9/月
              </a>
            ) : (
              <span className="block w-full cursor-not-allowed rounded-full bg-black/10 py-2.5 text-center text-sm font-medium text-zinc-500 dark:bg-white/10 dark:text-zinc-400">
                支付通道即将上线
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 详细对比表 */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/15">
        <h2 className="mb-4 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          详细对比
        </h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/10 text-left text-zinc-500 dark:border-white/15 dark:text-zinc-400">
              <th className="pb-2 font-medium">功能</th>
              <th className="pb-2 font-medium">免费版</th>
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
          <strong className="text-black dark:text-zinc-100">怎么取消？</strong>{" "}
          在付款确认邮件里有订阅管理入口，一键取消，次月不再扣费，当月额度保留。
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">支持什么支付方式？</strong>{" "}
          银行卡 / PayPal / Apple Pay 等（由 Creem 收银台支持，自动处理税务，按地区自动展示可用方式）。
        </p>
        <p>
          <strong className="text-black dark:text-zinc-100">发票？</strong>{" "}
          付款后可联系客服开具。
        </p>
      </section>
    </main>
  );
}
