"use client";  // ← 这行字：声明这个组件要在浏览器里跑（因为下面要用 state 和点击事件）

import { useState } from "react";

// 这两行数组是“死的”，不会变——放在组件外面更省性能
const 平台 = ["小红书", "公众号", "抖音文案"];
const 风格 = ["亲切口语", "专业干货", "幽默吐槽", "情绪共鸣"];

export default function GeneratePage() {
  // state ①：用户选了哪些平台
  const [选中的平台, 设置选中的平台] = useState<string[]>([]);

  // state ②：用户选了哪些风格
  const [选中的风格, 设置选中的风格] = useState<string[]>([]);

  // 通用切换函数：点已选的 → 取消；点未选的 → 加上
  function 切换(当前列表: string[], 设置函数: (新值: string[]) => void, 名称: string) {
    设置函数(
      当前列表.includes(名称)
        ? 当前列表.filter((项) => 项 !== 名称)  // 已经在 → 剔除
        : [...当前列表, 名称]                    // 不在 → 追加
    );
  }

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

      {/* ① 选产品 */}
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

      {/* ② 选平台 */}
      <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>② 选平台（可多选）</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">已选 {选中的平台.length}</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {平台.map((名称) => {
            const 已选 = 选中的平台.includes(名称);
            return (
              <button
                key={名称}
                type="button"
                onClick={() => 切换(选中的平台, 设置选中的平台, 名称)}
                className={
                  已选
                    ? "rounded-full bg-black px-4 py-2 text-sm text-white transition-colors dark:bg-white dark:text-black"
                    : "rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40"
                }
              >
                {已选 ? "✓ " : ""}
                {名称}
              </button>
            );
          })}
        </div>
      </section>

      {/* ③ 选风格 */}
      <section className="mb-8 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>③ 选风格（可多选）</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">已选 {选中的风格.length}</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {风格.map((名称) => {
            const 已选 = 选中的风格.includes(名称);
            return (
              <button
                key={名称}
                type="button"
                onClick={() => 切换(选中的风格, 设置选中的风格, 名称)}
                className={
                  已选
                    ? "rounded-full bg-black px-4 py-2 text-sm text-white transition-colors dark:bg-white dark:text-black"
                    : "rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40"
                }
              >
                {已选 ? "✓ " : ""}
                {名称}
              </button>
            );
          })}
        </div>
      </section>

      {/* 生成按钮：会根据选择数量"算"出一共会生成多少条 */}
      <button
        type="button"
        disabled={选中的平台.length === 0 || 选中的风格.length === 0}
        className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-black text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700"
      >
        {选中的平台.length === 0 || 选中的风格.length === 0
          ? "至少选 1 个平台 + 1 个风格"
          : `生成 ${选中的平台.length * 选中的风格.length * 5} 条文案`}
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