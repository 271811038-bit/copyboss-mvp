// 首页 —— 充实版：产品是什么 / 怎么用 / 适合谁 / 常见问题

import Link from "next/link";

const 功能点 = [
  {
    标题: "三平台一键适配",
    描述: "同一个主题，自动生成小红书种草体、公众号深度体、抖音短句体，不用再为不同平台重新组织语言。",
    图标: "🎯",
  },
  {
    标题: "多种风格任选",
    描述: "种草风、干货风、故事风、促销风……按内容场景切换语气，告别千篇一律的 AI 味。",
    图标: "✍️",
  },
  {
    标题: "秒级出稿",
    描述: "输入主题和关键词，约 30 秒拿到可直接发布的初稿，再微调即可发布。",
    图标: "⚡",
  },
];

const 使用步骤 = [
  { 步骤: "1", 标题: "输入主题", 描述: "写下你的产品、活动或选题，附上想突出的关键词。" },
  { 步骤: "2", 标题: "选择平台与风格", 描述: "小红书 / 公众号 / 抖音，配上喜欢的文风。" },
  { 步骤: "3", 标题: "生成并微调", 描述: "30 秒拿到三段文案，不满意可重新生成，满意即发布。" },
];

const 常见问题 = [
  {
    问: "生成的内容可以直接发布吗？",
    答: "建议把 AI 初稿当作「质量不错的草稿」——发布前花一两分钟检查事实与表达，效果最好。AI 生成内容可能存在不准确之处。",
  },
  {
    问: "免费版和 Pro 有什么区别？",
    答: "免费版每天 5 次生成额度；Pro（$2.99/月）每天 30 次，适合需要持续产出的商家与博主。可随时取消。",
  },
  {
    问: "我的输入内容会被公开吗？",
    答: "不会。你的输入与生成记录仅自己可见，详情见我们的隐私政策。",
  },
];

export default function Home() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-4xl px-6">
        {/* Hero */}
        <section className="flex flex-col items-center gap-6 py-20 text-center">
          <span className="rounded-full bg-black px-4 py-1 text-sm font-medium text-white dark:bg-white dark:text-black">
            CopyBoss
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            让 CopyBoss 成为你可靠的 AI 文案优化师
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            30 秒，为同一个主题生成小红书、公众号、抖音三个平台、多种风格的营销文案。
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
            <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">小红书</span>
            <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">公众号</span>
            <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">抖音文案</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              className="flex h-12 items-center justify-center rounded-full bg-black px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
              href="/generate"
            >
              免费开始（每天 5 次）
            </Link>
            <Link
              className="flex h-12 items-center justify-center rounded-full border border-black/20 px-8 text-base font-medium text-black transition-colors hover:bg-zinc-100 dark:border-white/25 dark:text-zinc-50 dark:hover:bg-zinc-900"
              href="/pricing"
            >
              查看 Pro 会员 👑
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
            三步出稿，就这么简单
          </h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {使用步骤.map((s) => (
              <div key={s.步骤} className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black text-sm font-semibold text-white dark:bg-white dark:text-black">
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
          <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">适合谁用？</h2>
          <p className="mx-auto mt-4 max-w-2xl text-zinc-600 dark:text-zinc-400 leading-7">
            需要持续产出内容却挤不出时间的<strong>小商家</strong>、想稳定更新的<strong>博主与个体创作者</strong>、
            以及帮客户写方案的<strong>自媒体运营者</strong>。你负责选题和把关，重复劳动交给 CopyBoss。
          </p>
        </section>

        {/* 常见问题 */}
        <section className="py-12">
          <h2 className="text-center text-2xl font-semibold text-black dark:text-zinc-50">常见问题</h2>
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
            现在就生成第一条文案
          </h2>
          <Link
            className="flex h-12 items-center justify-center rounded-full bg-black px-10 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
            href="/generate"
          >
            免费开始
          </Link>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            有问题？联系客服 271811038@qq.com
          </p>
        </section>
      </main>
    </div>
  );
}
