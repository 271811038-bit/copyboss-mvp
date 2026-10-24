"use client";

// ============================================================
// 生成表单（零 JS 依赖版）
//
// 核心变化：选平台/选风格不再用 onClick + state（JS 挂了就失灵），
// 改用浏览器原生 checkbox —— 选中/取消是浏览器天生的能力，
// 不需要一行 JS。提交走 Server Action（JS 正常时 React 拦截，
// JS 挂掉时原生 POST，服务器生成后整页重渲染出新结果）。
// ============================================================

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { 生成文案Action } from "./actions";
import type { 生成结果状态, 额度快照 } from "./types";

const 平台 = ["小红书", "公众号", "抖音文案"];
const 风格 = ["亲切口语", "专业干货", "幽默吐槽", "情绪共鸣"];

// 还没生成过时的初始状态（error 空、无结果、额度用页面初始值）
const 初始状态: 生成结果状态 = {
  error: "",
  文案们: [],
  错误们: [],
  额度: null,
};

// 提交按钮（单独组件才能用 useFormStatus 拿"提交中"状态）
function 提交按钮({ 超额 }: { 超额: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || 超额}
      className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-base font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {pending ? "AI 正在写…（约 10-30 秒，请勿离开）" : "生成文案"}
    </button>
  );
}

export default function GenerateForm({
  初始额度,
}: {
  初始额度: {
    plan: string;
    已用: number;
    剩余: number;
    总数: number;
    超额: boolean;
    下次重置: string;
  };
}) {
  // useActionState：JS 正常时 React 拦截提交并拿返回值；
  // JS 挂掉时浏览器原生提交，服务器返回的 HTML 里已带着新状态
  const [状态, 表单动作, 提交中] = useActionState(生成文案Action, 初始状态);

  // 额度：优先用生成后返回的最新值，否则用页面初始值
  const 额度: 额度快照 & { 下次重置: string } = {
    ...初始额度,
    ...(状态.额度 ?? {}),
    下次重置: 初始额度.下次重置,
  };

  // state：刚复制的是第几条（纯增强，无 JS 时按钮不显示也不碍事）
  const [已复制, 设置已复制] = useState<number | null>(null);

  // 一键复制（复制不计额度）—— 仅 JS 可用时生效
  async function 复制文案(内容: string, 序号: number) {
    try {
      await navigator.clipboard.writeText(内容);
    } catch {
      const 文本框 = document.createElement("textarea");
      文本框.value = 内容;
      document.body.appendChild(文本框);
      文本框.select();
      document.execCommand("copy");
      document.body.removeChild(文本框);
    }
    设置已复制(序号);
    setTimeout(() => 设置已复制(null), 2000);
  }

  // 把下次重置时间转成"距离 X 小时 Y 分"
  const 距离重置 = (() => {
    const 目标 = new Date(额度.下次重置).getTime();
    const 现在 = Date.now();
    const 差 = Math.max(0, 目标 - 现在);
    const 小时 = Math.floor(差 / (60 * 60 * 1000));
    const 分 = Math.floor((差 % (60 * 60 * 1000)) / (60 * 1000));
    if (小时 > 0) return `${小时} 小时 ${分} 分`;
    return `${分} 分`;
  })();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 页面标题 */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          生成文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          说清你的产品，挑好平台和风格，30 秒拿到候选文案。
        </p>
      </div>

      {/* 额度提示条 */}
      <section
        className={`mb-6 flex items-center justify-between rounded-xl border p-4 ${
          额度.超额
            ? "border-orange-300 bg-orange-50 text-orange-900 dark:border-orange-900 dark:bg-orange-950 dark:text-orange-200"
            : 额度.剩余 <= 1
              ? "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200"
              : "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200"
        }`}
      >
        <div className="flex items-center gap-2 text-sm">
          <span className="text-lg">{额度.超额 ? "🚫" : 额度.plan === "PRO" ? "👑" : "🎁"}</span>
          <span>
            今日{额度.plan === "PRO" ? "Pro" : "免费"}额度：
            <strong>
              {额度.已用} / {额度.总数}
            </strong>
            ，剩余 <strong>{额度.剩余}</strong> 次
            {额度.plan === "PRO" && (额度.加油包剩余 ?? 0) > 0 && (
              <span className="ml-1 text-violet-600 dark:text-violet-400">
                （含加油包 {额度.加油包剩余} 次）
              </span>
            )}
          </span>
          {额度.plan === "PRO" && (
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              Pro 会员
            </span>
          )}
        </div>
        {!额度.超额 && (
          <span className="text-xs opacity-75">距离重置还有 {距离重置}</span>
        )}
        {额度.超额 && (
          <span className="text-xs font-medium opacity-90">
            明天 0 点（北京时间）自动重置
          </span>
        )}
        {额度.plan !== "PRO" && (
          <Link
            href="/pricing"
            className="ml-3 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-85"
          >
            升级 Pro · 10 次/天
          </Link>
        )}
      </section>

      {/* 关键：整个表单用 form action（Server Action），无 JS 也能原生提交 */}
      <form action={表单动作}>
        {/* ① 产品描述 */}
        <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ① 你的产品是什么（写给 AI 看的产品说明）
          </h2>
          <textarea
            name="product"
            rows={4}
            maxLength={500}
            required
            minLength={5}
            placeholder="例如：CopyBoss 是一个帮中小老板写营销文案的 AI 工具，输入产品信息就能一键生成小红书、公众号、抖音的文案，注册就能免费试用。"
            className="w-full resize-none rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black/40 dark:border-white/20 dark:text-zinc-100 dark:focus:border-white/40"
          />
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            最多 500 字 · 至少 5 个字 · 写得越具体（卖点、人群、价格），文案越准
          </p>
          <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            💡 小技巧：说明产品是什么、卖给谁、有什么独特卖点，AI 生成的文案会更贴合你的业务。生成结果由
            AI 自动创作，发布前请自行检查内容准确性。生成的内容仅你可见，使用规则见
            <a href="/acceptable-use" className="mx-1 underline hover:text-black dark:hover:text-zinc-50">
              可接受使用政策
            </a>。
          </p>
        </section>

        {/* ② 选平台 —— 原生 checkbox，选中态由浏览器自己维护（零 JS） */}
        <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ② 选平台（可多选，点击胶囊即选中/取消）
          </h2>
          <div className="flex flex-wrap gap-3">
            {平台.map((名称) => (
              <label key={名称} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="platform"
                  value={名称}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-500 peer-checked:text-white peer-checked:shadow-sm dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40 dark:peer-checked:border-transparent dark:peer-checked:from-violet-500 dark:peer-checked:to-fuchsia-500 dark:peer-checked:text-white">
                  {名称}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* ③ 选风格 —— 同上，原生 checkbox */}
        <section className="mb-8 rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ③ 选风格（可多选）
          </h2>
          <div className="flex flex-wrap gap-3">
            {风格.map((名称) => (
              <label key={名称} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="style"
                  value={名称}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-500 peer-checked:text-white peer-checked:shadow-sm dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40 dark:peer-checked:border-transparent dark:peer-checked:from-violet-500 dark:peer-checked:to-fuchsia-500 dark:peer-checked:text-white">
                  {名称}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 出错提示 */}
        {状态.error && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {状态.error}
          </div>
        )}
        {状态.错误们.length > 0 && 状态.文案们.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            部分组合生成失败：{状态.错误们.join("；")}
          </div>
        )}

        <提交按钮 超额={额度.超额} />
      </form>

      {/* 结果区 */}
      <section>
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>候选文案</span>
          {状态.文案们.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              共 {状态.文案们.length} 条 · 已自动存入历史
            </span>
          )}
        </h2>

        {状态.文案们.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
            {额度.超额 ? (
              额度.plan === "PRO" ? (
                <>
                  <span>今日会员额度和加油包都已用完，明天 0 点重置。</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="/api/checkout/creem?type=pack"
                      className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-85"
                    >
                      加油包 · $1 / 10 次 →
                    </a>
                    <a
                      href="/pricing"
                      className="rounded-full border border-black/15 px-4 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      管理订阅
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <span>今日免费额度（1 次）已用完，明天 0 点重置。</span>
                  <a
                    href="/pricing"
                    className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-85"
                  >
                    升级 Pro · 每天 10 次 →
                  </a>
                </>
              )
            ) : (
              "还没有内容。填好产品说明、选好平台风格、点上面的按钮，候选文案会出现在这里。"
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {状态.文案们.map((条, 序号) => (
              <div
                key={序号}
                className="rounded-xl border border-black/10 p-4 dark:border-white/15"
              >
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{条.平台}</span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">{条.风格}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => 复制文案(条.内容, 序号)}
                    className="rounded-full border border-black/15 px-3 py-1 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-800"
                  >
                    {已复制 === 序号 ? "✓ 已复制" : "复制"}
                  </button>
                </div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-black dark:text-zinc-100">{条.内容}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
