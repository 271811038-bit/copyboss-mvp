// 首页 —— 充实版：产品是什么 / 怎么用 / 适合谁 / 常见问题

import Link from "next/link";

const 功能点 = [
  {
    标题: "One topic, every platform",
    描述: "Write about your product once — get platform-native captions for Instagram, TikTok, LinkedIn, X and YouTube. No more rewriting for each channel.",
    图标: "🎯",
  },
  {
    标题: "Four tones to match your brand",
    描述: "Friendly, Professional, Witty or Story-driven — switch the voice to fit the moment instead of sounding like every other AI post.",
    图标: "✍️",
  },
  {
    标题: "Publish-ready in seconds",
    描述: "Hit generate and get your first draft in about 30 seconds — ready to post or fine-tune. Stop staring at a blank text box.",
    图标: "⚡",
  },
];

const 使用步骤 = [
  { 步骤: "1", 标题: "Describe your product", 描述: "Tell the AI what you sell, who it's for, and what makes it special." },
  { 步骤: "2", 标题: "Pick platforms & tone", 描述: "Instagram / TikTok / LinkedIn / X / YouTube, with the voice you want." },
  { 步骤: "3", 标题: "Generate & post", 描述: "Get your copy in 30 seconds. Not perfect? Regenerate. Good? Publish." },
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

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 py-20 text-center">
          <span className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1 text-sm font-semibold text-white shadow-sm">
            ✨ CopyBoss
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            Your AI copywriter for
            <span className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 bg-clip-text text-transparent"> every platform</span>
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Describe your product once. Get ready-to-publish copy for Instagram, TikTok, LinkedIn, X and YouTube in 30 seconds.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="rounded-full border border-rose-200 bg-rose-50 px-4 py-1.5 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">Instagram</span>
            <span className="rounded-full border border-blue-200 bg-blue-50 px-4 py-1.5 text-blue-600 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-300">LinkedIn</span>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-4 py-1.5 text-orange-600 dark:border-orange-900/50 dark:bg-orange-950/40 dark:text-orange-300">TikTok</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              className="flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-8 text-base font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/30"
              href="/generate"
            >
              Start free (3 copies/day)
            </Link>
            <Link
              className="flex h-12 items-center justify-center rounded-full border border-black/20 px-8 text-base font-medium text-black transition-colors hover:bg-zinc-100 dark:border-white/25 dark:text-zinc-50 dark:hover:bg-zinc-900"
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
              className="rounded-2xl border border-black/10 bg-white p-6 text-left dark:border-white/15 dark:bg-zinc-950"
            >
              <div className="text-2xl">{f.图标}</div>
              <h2 className="mt-3 font-semibold text-black dark:text-zinc-50">{f.标题}</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{f.描述}</p>
            </div>
          ))}
        </section>

        {/* 使用步骤 */}
        <section className="py-12">
          <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">
            Three steps. That's it.
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {使用步骤.map((s) => (
              <div key={s.步骤} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-semibold text-white shadow-sm">
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
            <strong>Small business owners</strong> who need content but have no time, <strong>creators &amp; bloggers</strong> who want to post consistently, and <strong>freelance marketers</strong> writing for clients. You bring the ideas — CopyBoss does the typing.
          </p>
        </section>

        {/* 常见问题 */}
        <section className="py-12">
          <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">FAQ</h2>
          <div className="mx-auto mt-8 flex max-w-2xl flex-col gap-4">
            {常见问题.map((q) => (
              <div
                key={q.问}
                className="rounded-2xl border border-black/10 bg-white p-5 text-left dark:border-white/15 dark:bg-zinc-950"
              >
                <h3 className="font-medium text-black dark:text-zinc-50">{q.问}</h3>
                <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">{q.答}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 底部 CTA */}
        <section className="flex flex-col items-center gap-4 py-16 text-center">
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
            Generate your first copy now
          </h2>
          <Link
            className="flex h-12 items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-10 text-base font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/30"
            href="/generate"
          >
            Start free
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Questions? Reach us at 271811038@qq.com
          </p>
        </section>
      </main>
    </div>
  );
}
