const 平台 = ["小红书", "公众号", "抖音文案"];
const 风格 = ["亲切口语", "专业干货", "幽默吐槽", "情绪共鸣"];

export default function GeneratePage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 页面标题 */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          生成文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          选一个产品，挑好平台和风格，30 秒拿到 5 条候选。
        </p>
      </div>

      {/* 第一步：选产品 */}
      <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          ① 选产品
        </h2>
        <select className="w-full rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-sm text-black outline-none dark:border-white/20 dark:text-zinc-100">
          <option>默认产品（示例）</option>
        </select>
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          还没建过产品？以后这里会有「新建产品」入口。
        </p>
      </section>

      {/* 第二步：选平台 */}
      <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          ② 选平台
        </h2>
        <div className="flex flex-wrap gap-3">
          {平台.map((名称) => (
            <span
              key={名称}
              className="rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 dark:border-white/20 dark:text-zinc-300"
            >
              {名称}
            </span>
          ))}
        </div>
      </section>

      {/* 第三步：选风格 */}
      <section className="mb-8 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          ③ 选风格
        </h2>
        <div className="flex flex-wrap gap-3">
          {风格.map((名称) => (
            <span
              key={名称}
              className="rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 dark:border-white/20 dark:text-zinc-300"
            >
              {名称}
            </span>
          ))}
        </div>
      </section>

      {/* 生成按钮（暂时点了没反应） */}
      <button className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-black text-base font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
        生成 5 条文案
      </button>

      {/* 结果区：现在还是空的 */}
      <section>
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          候选文案
        </h2>
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
          还没有内容。点上面的按钮，候选文案会出现在这里。
        </div>
      </section>
    </main>
  );
}
