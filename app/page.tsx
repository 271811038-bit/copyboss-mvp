// 首页 —— 2026-10-26 视觉升级版：极光背景 + 品牌色系全面铺开

import Link from "next/link";

const 功能点 = [
  {
    标题: "One topic, every platform",
    描述: "Write about your product once — get platform-native captions for Instagram, TikTok, LinkedIn, X and YouTube. No more rewriting for each channel.",
    图标: "🎯",
    色板: "bg-violet-50 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
    顶线: "from-violet-600 to-purple-500",
  },
  {
    标题: "Four tones to match your brand",
    描述: "Friendly, Professional, Witty or Story-driven — switch the voice to fit the moment instead of sounding like every other AI post.",
    图标: "✍️",
    色板: "bg-fuchsia-50 text-fuchsia-600 dark:bg-fuchsia-950/60 dark:text-fuchsia-300",
    顶线: "from-fuchsia-500 to-pink-500",
  },
  {
    标题: "Publish-ready in seconds",
    描述: "Hit generate and get your first draft in about 30 seconds — ready to post or fine-tune. Stop staring at a blank text box.",
    图标: "⚡",
    色板: "bg-orange-50 text-orange-600 dark:bg-orange-950/60 dark:text-orange-300",
    顶线: "from-orange-400 to-amber-400",
  },
];

const 使用步骤 = [
  { 步骤: "1", 标题: "Describe your product", 描述: "Tell the AI what you sell, who it's for, and what makes it special.", 渐变: "from-violet-600 to-purple-500" },
  { 步骤: "2", 标题: "Pick platforms & tone", 描述: "Instagram / TikTok / LinkedIn / X / YouTube, with the voice you want.", 渐变: "from-fuchsia-500 to-pink-500" },
  { 步骤: "3", 标题: "Generate & post", 描述: "Get your copy in 30 seconds. Not perfect? Regenerate. Good? Publish.", 渐变: "from-orange-400 to-amber-400" },
];

const 常见问题 = [
  {
    问: "Can I publish the output directly?",
    答: "Treat the AI draft as a strong first draft — a quick one-minute fact-check and tone pass before publishing gets the best results. AI-generated content may contain inaccuracies.",
  },
  {
    问: "What's the difference between Free and Pro?",
    答: "1 credit = 1 platform × 1 tone (3 copies). Free gives you 1 credit per day; Pro is $9.99/mo with 10 credits per day (30 copies), or $99/year with 15 credits per day (45 copies). Top-up packs from $1. Cancel anytime.",
  },
  {
    问: "Is my input public?",
    答: "No. Your prompts and generated copy are visible only to you. See our privacy policy for details.",
  },
];

const 平台徽章们 = [
  { 名: "Instagram", 样式: "border-pink-300 bg-pink-50 text-pink-600 dark:border-pink-900/60 dark:bg-pink-950/40 dark:text-pink-300" },
  { 名: "TikTok", 样式: "border-cyan-300 bg-cyan-50 text-cyan-700 dark:border-cyan-900/60 dark:bg-cyan-950/40 dark:text-cyan-300" },
  { 名: "LinkedIn", 样式: "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300" },
  { 名: "X", 样式: "border-zinc-300 bg-zinc-100 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  { 名: "YouTube", 样式: "border-red-300 bg-red-50 text-red-600 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300" },
];

export default function Home() {
  return (
    <div className="page-aurora flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 py-24 text-center">
          <span className="rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-4 py-1 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/25">
            ✨ CopyBoss
          </span>
          <h1 className="text-5xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50 sm:text-6xl">
            Your AI copywriter for
            <span className="brand-text"> every platform</span>
          </h1>
          <p className="max-w-lg text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Describe your product once. Get ready-to-publish copy for every major social platform in 30 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2.5 text-sm">
            {平台徽章们.map((p) => (
              <span key={p.名} className={`rounded-full border px-4 py-1.5 font-medium ${p.样式}`}>
                {p.名}
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <Link
              className="flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-8 text-base font-semibold text-white shadow-lg shadow-fuchsia-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-fuchsia-500/40"
              href="/generate"
            >
              Start free (3 copies/day)
            </Link>
            <Link
              className="flex h-12 items-center justify-center rounded-full border border-black/20 bg-white/60 px-8 text-base font-medium text-black backdrop-blur transition-colors hover:border-fuchsia-400 hover:text-fuchsia-600 dark:border-white/25 dark:bg-zinc-900/60 dark:text-zinc-50 dark:hover:border-fuchsia-500 dark:hover:text-fuchsia-300"
              href="/pricing"
            >
              See Pro 👑
            </Link>
          </div>
        </section>

        {/* 功能点 */}
        <section className="grid gap-6 py-12 sm:grid-cols-3">
          {功能点.map((f) => (
            <div
              key={f.标题}
              className="card-lift overflow-hidden rounded-2xl border border-black/10 bg-white p-6 text-left dark:border-white/15 dark:bg-zinc-950"
            >
              <div className={`-mx-6 -mt-6 mb-5 h-1 bg-gradient-to-r ${f.顶线}`} />
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl text-2xl ${f.色板}`}>
                {f.图标}
              </div>
              <h2 className="mt-3 font-semibold text-black dark:text-zinc-50">{f.标题}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.描述}</p>
            </div>
          ))}
        </section>

        {/* 使用步骤 */}
        <section className="py-12">
          <h2 className="text-center text-3xl font-semibold text-black dark:text-zinc-50">
            Three steps.{" "}
            <span className="brand-text">That's it.</span>
          </h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {使用步骤.map((s) => (
              <div key={s.步骤} className="flex flex-col items-center gap-2 text-center">
                <div className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${s.渐变} text-sm font-semibold text-white shadow-md`}>
                  {s.步骤}
                </div>
                <h3 className="font-medium text-black dark:text-zinc-50">{s.标题}</h3>
                <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-400">{s.描述}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 适合谁 */}
        <section className="py-12 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">Who is it for?</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400 leading-7">
            <strong className="text-violet-700 dark:text-violet-300">Small business owners</strong> who need content but have no time,{" "}
            <strong className="text-fuchsia-600 dark:text-fuchsia-300">creators &amp; bloggers</strong> who want to post consistently, and{" "}
            <strong className="text-orange-600 dark:text-orange-300">freelance marketers</strong> writing for clients. You bring the ideas — CopyBoss does the typing.
          </p>
        </section>

        {/* 常见问题 */}
        <section className="py-12">
          <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">FAQ</h2>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
            {常见问题.map((q) => (
              <div
                key={q.问}
                className="card-lift rounded-2xl border border-black/10 bg-white p-5 text-left dark:border-white/15 dark:bg-zinc-950"
              >
                <h3 className="font-medium text-black dark:text-zinc-50">{q.问}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{q.答}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 底部 CTA —— 渐变大卡片 */}
        <section className="pb-16 pt-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-fuchsia-500 to-orange-400 p-10 text-center shadow-xl shadow-fuchsia-500/25">
            <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <h2 className="text-3xl font-semibold text-white">
              Generate your first copy now
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/85">
              Free every day — no credit card needed. Brand voice, 5 platforms, 4 tones, one click.
            </p>
            <Link
              className="mt-6 inline-flex h-12 items-center justify-center rounded-full bg-white px-10 text-base font-semibold text-fuchsia-600 shadow-lg transition-transform hover:scale-[1.03]"
              href="/generate"
            >
              Start free →
            </Link>
          </div>
          <p className="mt-6 text-center text-xs text-zinc-400 dark:text-zinc-500">
            Questions? Reach us at 271811038@qq.com
          </p>
        </section>
      </main>
    </div>
  );
}
