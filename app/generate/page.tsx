"use client"; // 这个组件要在浏览器里跑（有用到 state 和点击事件）

import { useState } from "react";
import Pill from "@/components/Pill";

// 这两行数组是“死的”，不会变——放在组件外面更省性能
const 平台 = ["小红书", "公众号", "抖音文案"];
const 风格 = ["亲切口语", "专业干货", "幽默吐槽", "情绪共鸣"];

// 自定义一个“类型”：一条文案长什么样（三个字段）
type 一条文案 = {
  平台: string;
  风格: string;
  内容: string;
};

export default function GeneratePage() {
  // state ①：用户选了哪些平台
  const [选中的平台, 设置选中的平台] = useState<string[]>([]);

  // state ②：用户选了哪些风格
  const [选中的风格, 设置选中的风格] = useState<string[]>([]);

  // state ③：生成的结果（现在还没有）
  const [结果, 设置结果] = useState<一条文案[]>([]);

  // 通用切换函数：点已选的 → 取消；点未选的 → 加上
  function 切换(当前列表: string[], 设置函数: (新值: string[]) => void, 名称: string) {
    设置函数(
      当前列表.includes(名称)
        ? 当前列表.filter((项) => 项 !== 名称)
        : [...当前列表, 名称]
    );
  }

  // 生成函数：目前是“假生成”，接上 AI 后只需改这一个函数
  function 生成() {
    const 候选: 一条文案[] = [];

    选中的平台.forEach((平台名) => {
      选中的风格.forEach((风格名) => {
        for (let i = 1; i <= 5; i++) {
          候选.push({
            平台: 平台名,
            风格: 风格名,
            内容: `（示例 ${i}）「${平台名}」×「${风格名}」：这里是占位文案，接上 AI 之后会变成真正可用的内容。`,
          });
        }
      });
    });

    设置结果(候选); // 把结果交给 state → 页面自动更新
  }

  const 未选够 = 选中的平台.length === 0 || 选中的风格.length === 0;

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
          {平台.map((名称) => (
            <Pill
              key={名称}
              名称={名称}
              已选={选中的平台.includes(名称)}
              onClick={() => 切换(选中的平台, 设置选中的平台, 名称)}
            />
          ))}
        </div>
      </section>

      {/* ③ 选风格 */}
      <section className="mb-8 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>③ 选风格（可多选）</span>
          <span className="text-xs text-zinc-400 dark:text-zinc-500">已选 {选中的风格.length}</span>
        </h2>
        <div className="flex flex-wrap gap-3">
          {风格.map((名称) => (
            <Pill
              key={名称}
              名称={名称}
              已选={选中的风格.includes(名称)}
              onClick={() => 切换(选中的风格, 设置选中的风格, 名称)}
            />
          ))}
        </div>
      </section>

      {/* 生成按钮 */}
      <button
        type="button"
        disabled={未选够}
        onClick={生成}
        className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-black text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700"
      >
        {未选够
          ? "至少选 1 个平台 + 1 个风格"
          : `生成 ${选中的平台.length * 选中的风格.length * 5} 条文案`}
      </button>

      {/* 结果区：条件渲染的核心战场 */}
      <section>
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>候选文案</span>
          {结果.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">共 {结果.length} 条</span>
          )}
        </h2>

        {/* 三元表达式：结果为空 → 显示占位框；不为空 → 显示文案列表 */}
        {结果.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
            还没有内容。点上面的按钮，候选文案会出现在这里。
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {结果.map((条, 序号) => (
              <div
                key={序号}
                className="rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="mb-2 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{条.平台}</span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{条.风格}</span>
                </div>
                <p className="text-sm leading-6 text-black dark:text-zinc-100">{条.内容}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}