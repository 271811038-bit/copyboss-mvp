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

  // state ③：产品描述（textarea 的内容）
  const [产品描述, 设置产品描述] = useState("");

  // state ④：生成的结果
  const [结果, 设置结果] = useState<一条文案[]>([]);

  // state ⑤：正在生成中（按钮转圈、防重复点击全靠它）
  const [生成中, 设置生成中] = useState(false);

  // state ⑥：出错信息（AI 调用失败时给用户一个交代）
  const [错误, 设置错误] = useState("");

  // state ⑦：提示来源（mock 演示 or 真 AI）
  const [来源, 设置来源] = useState("");

  // 通用切换函数：点已选的 → 取消；点未选的 → 加上
  function 切换(当前列表: string[], 设置函数: (新值: string[]) => void, 名称: string) {
    设置函数(
      当前列表.includes(名称)
        ? 当前列表.filter((项) => 项 !== 名称)
        : [...当前列表, 名称]
    );
  }

  // 生成函数：async 版——因为要「等」后端（后端要等 AI，AI 要思考几秒）
  async function 生成() {
    设置生成中(true); // 按钮进入"工作中"状态
    设置错误("");
    设置结果([]);

    try {
      // fetch = 浏览器向后端发请求（相当于递单子给后厨）
      const 响应 = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          平台们: 选中的平台,
          风格们: 选中的风格,
          产品: 产品描述,
        }),
      });

      const 数据 = await 响应.json();

      if (!响应.ok) {
        设置错误(数据.error || "生成失败，请稍后再试");
        return;
      }

      // 后端返回的英文字段 → 转成页面要的结构
      const 候选: 一条文案[] = 数据.文案们.map(
        (条: { platform: string; style: string; content: string }) => ({
          平台: 条.platform,
          风格: 条.style,
          内容: 条.content,
        })
      );

      设置结果(候选);
      设置来源(数据.用的AI === "mock" ? "（演示模式：还没接 AI key）" : "");
      if (数据.错误们?.length > 0) {
        设置错误(`部分组合生成失败：${数据.错误们.join("；")}`);
      }
    } catch {
      设置错误("网络异常，请检查网络后重试");
    } finally {
      // finally = 不管成功失败都要做的事：解除"工作中"状态
      设置生成中(false);
    }
  }

  const 产品太短 = 产品描述.trim().length < 5;
  const 未选够 = 选中的平台.length === 0 || 选中的风格.length === 0 || 产品太短;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 页面标题 */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          生成文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          说清你的产品，挑好平台和风格，30 秒拿到候选文案。
        </p>
      </div>

      {/* ① 产品描述 */}
      <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
        <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
          ① 你的产品是什么（写给 AI 看的产品说明）
        </h2>
        <textarea
          value={产品描述}
          onChange={(事件) => 设置产品描述(事件.target.value)}
          rows={4}
          maxLength={500}
          placeholder="例如：CopyBoss 是一个帮中小老板写营销文案的 AI 工具，输入产品信息就能一键生成小红书、公众号、抖音的文案，每天免费 5 次。"
          className="w-full resize-none rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black/40 dark:border-white/20 dark:text-zinc-100 dark:focus:border-white/40"
        />
        <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
          {产品描述.trim().length}/500 字 · 写得越具体（卖点、人群、价格），文案越准
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

      {/* 出错提示（有错才显示） */}
      {错误 && (
        <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {错误}
        </div>
      )}

      {/* 生成按钮 */}
      <button
        type="button"
        disabled={未选够 || 生成中}
        onClick={生成}
        className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-black text-base font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300 dark:bg-white dark:text-black dark:hover:bg-zinc-200 dark:disabled:bg-zinc-700"
      >
        {生成中
          ? "AI 正在写…（约 10-30 秒）"
          : 未选够
            ? 选中的平台.length === 0 || 选中的风格.length === 0
              ? "至少选 1 个平台 + 1 个风格"
              : "先写至少 5 个字的产品描述"
            : `生成 ${选中的平台.length * 选中的风格.length * 5} 条文案`}
      </button>

      {/* 结果区：条件渲染的核心战场 */}
      <section>
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>候选文案{来源}</span>
          {结果.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">共 {结果.length} 条 · 已自动存入历史</span>
          )}
        </h2>

        {/* 三元表达式：结果为空 → 显示占位框；不为空 → 显示文案列表 */}
        {结果.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
            还没有内容。填好产品说明、点上面的按钮，候选文案会出现在这里。
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
                {/* whitespace-pre-wrap：保留 AI 输出里的换行，否则全挤成一坨 */}
                <p className="whitespace-pre-wrap text-sm leading-6 text-black dark:text-zinc-100">{条.内容}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
