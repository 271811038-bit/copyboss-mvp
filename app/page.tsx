export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-10 py-32 px-8 text-center">
        {/* 品牌 */}
        <div className="flex flex-col items-center gap-4">
          <span className="rounded-full bg-black px-4 py-1 text-sm font-medium text-white dark:bg-white dark:text-black">
            CopyBoss
          </span>
          <h1 className="text-4xl font-semibold leading-tight tracking-tight text-black dark:text-zinc-50">
            让 CopyBoss 成为你可靠的 AI 文案优化师
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            30 秒，为同一个主题生成小红书、公众号、抖音三个平台、多种风格的营销文案。
          </p>
        </div>

        {/* 首发平台 */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
          <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">
            小红书
          </span>
          <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">
            公众号
          </span>
          <span className="rounded-full border border-black/10 px-4 py-1.5 dark:border-white/20">
            抖音文案
          </span>
        </div>

        {/* 开始按钮 */}
        <a
          className="flex h-12 w-full max-w-xs items-center justify-center rounded-full bg-black px-8 text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
          href="#"
        >
          免费开始（每天 5 次）
        </a>

        <p className="text-xs text-zinc-400 dark:text-zinc-500">
          CopyBoss MVP · 由鹏总主刀开发中
        </p>
      </main>
    </div>
  );
}
