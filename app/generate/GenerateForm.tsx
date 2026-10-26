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

const 平台 = ["Instagram", "TikTok", "LinkedIn", "X", "YouTube"];
const 风格 = ["Friendly", "Professional", "Witty", "Story"];

// 还没生成过时的初始状态（error 空、无结果、额度用页面初始值）
const 初始状态: 生成结果状态 = {
  error: "",
  文案们: [],
  错误们: [],
  额度: null,
};

// 1 credit = 1 平台 × 1 风格 = 3 条（与 lib/limits.ts 的 每额度条数 保持一致）
const 每额度条数 = 3;

// 提交按钮（单独组件才能用 useFormStatus 拿"提交中"状态）
function 提交按钮({ 超额, 需额度, 额度不足 }: { 超额: boolean; 需额度: number; 额度不足: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending || 超额 || 额度不足}
      className="mb-10 flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 text-base font-semibold text-white shadow-md shadow-fuchsia-500/20 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
    >
      {pending
        ? "AI is writing… (10-20s, don't leave this page)"
        : 需额度 > 0
          ? `Generate · ${需额度} credit${需额度 > 1 ? "s" : ""} → ${需额度 * 每额度条数} copies`
          : "Generate Copy"}
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

  // 已选平台/风格：只用于实时展示"本次消耗多少额度"。
  // 无 JS 时这里不生效，但服务端仍会精确校验（不依赖前端）。
  const [已选平台, 设已选平台] = useState<string[]>([]);
  const [已选风格, 设已选风格] = useState<string[]>([]);

  function 切换(列表: string[], 值: string, 选中: boolean): string[] {
    return 选中 ? [...new Set([...列表, 值])] : 列表.filter((x) => x !== 值);
  }

  // 本次消耗 = 平台数 × 风格数（1 credit 出 3 条）
  const 需额度 = 已选平台.length * 已选风格.length;
  const 额度不足 = 需额度 > 额度.剩余;

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

  // 把下次重置时间转成"Xh Ym left"
  const 距离重置 = (() => {
    const 目标 = new Date(额度.下次重置).getTime();
    const 现在 = Date.now();
    const 差 = Math.max(0, 目标 - 现在);
    const 小时 = Math.floor(差 / (60 * 60 * 1000));
    const 分 = Math.floor((差 % (60 * 60 * 1000)) / (60 * 1000));
    if (小时 > 0) return `${小时}h ${分}m`;
    return `${分}m`;
  })();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 页面标题 */}
      <div className="mb-6 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Generate Copy
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Describe your product, pick platforms and tone, get publish-ready copy in 30 seconds.
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
          <span className="text-lg">{额度.超额 ? "🚫" : 额度.plan === "FREE" ? "🎁" : "👑"}</span>
          <span>
            Daily {额度.plan === "PRO_YEARLY" ? "Pro Yearly" : 额度.plan === "PRO" ? "Pro" : "free"} quota:
            <strong>
              {" "}
              {额度.已用} / {额度.总数}
            </strong>
            , <strong>{额度.剩余}</strong> credits left
            {额度.plan === "PRO" && (额度.加油包剩余 ?? 0) > 0 && (
              <span className="ml-1 text-violet-600 dark:text-violet-400">
                (incl. {额度.加油包剩余} top-up credits)
              </span>
            )}
          </span>
          {额度.plan !== "FREE" && (
            <span className="rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-0.5 text-xs font-medium text-white">
              {额度.plan === "PRO_YEARLY" ? "Pro Yearly" : "Pro"}
            </span>
          )}
        </div>
        {!额度.超额 && (
          <span className="text-xs opacity-75">Resets in {距离重置}</span>
        )}
        {额度.超额 && (
          <span className="text-xs font-medium opacity-90">
            Resets automatically at midnight UTC
          </span>
        )}
        {额度.plan !== "PRO" && (
          <Link
            href="/pricing"
            className="ml-3 shrink-0 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-opacity hover:opacity-85"
          >
            Upgrade Pro · 10 credits/day
          </Link>
        )}
      </section>

      {/* 关键：整个表单用 form action（Server Action），无 JS 也能原生提交 */}
      <form action={表单动作}>
        {/* ① 产品描述 */}
        <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ① What's your product? (brief for the AI)
          </h2>
          <textarea
            name="product"
            rows={4}
            maxLength={500}
            required
            minLength={5}
            placeholder="e.g. CopyBoss is an AI copywriting tool for small business owners — describe your product once and get ready-to-publish Instagram, TikTok and LinkedIn copy in 30 seconds."
            className="w-full resize-none rounded-lg border border-black/15 bg-transparent px-4 py-2.5 text-sm text-black outline-none placeholder:text-zinc-400 focus:border-black/40 dark:border-white/20 dark:text-zinc-100 dark:focus:border-white/40"
          />
          <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
            Max 500 chars · min 5 chars · the more specific (features, audience, price), the better the copy
          </p>
          <p className="mt-3 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            💡 Tip: explain what the product is, who it's for and what makes it unique — the AI will
            write copy that fits your business much better. Output is AI-generated; review it before
            publishing. Only you can see what you generate. See our{" "}
            <a href="/acceptable-use" className="underline hover:text-black dark:hover:text-zinc-50">
              Acceptable Use Policy
            </a>
            .
          </p>
        </section>

        {/* ② 选平台 —— 原生 checkbox，选中态由浏览器自己维护（零 JS） */}
        <section className="mb-5 rounded-xl border border-black/10 p-5 dark:border-white/15">
          <h2 className="mb-3 text-sm font-medium text-zinc-500 dark:text-zinc-400">
            ② Pick platforms (multi-select, click a pill to toggle)
          </h2>
          <p className="mb-3 rounded-lg bg-violet-50 px-3 py-2 text-xs leading-5 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300">
            1 credit = 1 platform × 1 tone → {每额度条数} copies. Selecting 2 platforms × 2 tones
            uses 4 credits.
          </p>
          <div className="flex flex-wrap gap-3">
            {平台.map((名称) => (
              <label key={名称} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="platform"
                  value={名称}
                  onChange={(e) => 设已选平台((前) => 切换(前, 名称, e.target.checked))}
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
            ③ Pick tone (multi-select)
          </h2>
          <div className="flex flex-wrap gap-3">
            {风格.map((名称) => (
              <label key={名称} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="style"
                  value={名称}
                  onChange={(e) => 设已选风格((前) => 切换(前, 名称, e.target.checked))}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 peer-checked:border-transparent peer-checked:bg-gradient-to-r peer-checked:from-violet-600 peer-checked:to-fuchsia-500 peer-checked:text-white peer-checked:shadow-sm dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40 dark:peer-checked:border-transparent dark:peer-checked:from-violet-500 dark:peer-checked:to-fuchsia-500 dark:peer-checked:text-white">
                  {名称}
                </span>
              </label>
            ))}
          </div>
        </section>

        {/* 本次消耗实时提示（JS 可用时；无 JS 由服务端校验兜底） */}
        {需额度 > 0 && (
          <div
            className={`mb-5 flex items-center justify-between rounded-xl border px-4 py-3 text-xs ${
              额度不足
                ? "border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
                : "border-violet-200 bg-violet-50 text-violet-800 dark:border-violet-900 dark:bg-violet-950/50 dark:text-violet-200"
            }`}
          >
            <span>
              This run: {已选平台.length} platform{已选平台.length > 1 ? "s" : ""} ×{" "}
              {已选风格.length} tone{已选风格.length > 1 ? "s" : ""} ={" "}
              <strong>{需额度} credit{需额度 > 1 ? "s" : ""}</strong> → {需额度 * 每额度条数} copies
            </span>
            <span className={额度不足 ? "font-medium" : "opacity-75"}>
              {额度不足 ? `Only ${额度.剩余} credit${额度.剩余 === 1 ? "" : "s"} left — reduce selection` : `${额度.剩余} credit${额度.剩余 === 1 ? "" : "s"} left today`}
            </span>
          </div>
        )}

        {/* 出错提示 */}
        {状态.error && (
          <div className="mb-5 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {状态.error}
          </div>
        )}
        {状态.错误们.length > 0 && 状态.文案们.length > 0 && (
          <div className="mb-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Some combinations failed: {状态.错误们.join("; ")}
          </div>
        )}

        <提交按钮 超额={额度.超额} 需额度={需额度} 额度不足={额度不足} />
      </form>

      {/* 结果区 */}
      <section>
        <h2 className="mb-3 flex items-center justify-between text-sm font-medium text-zinc-500 dark:text-zinc-400">
          <span>Your copy</span>
          {状态.文案们.length > 0 && (
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              {状态.文案们.length} saved to history
              {typeof 状态.消耗 === "number" && 状态.消耗 > 0 ? ` · ${状态.消耗} credit${状态.消耗 > 1 ? "s" : ""} used` : ""}
            </span>
          )}
        </h2>

        {状态.文案们.length === 0 ? (
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
            {额度.超额 ? (
              额度.plan !== "FREE" ? (
                <>
                  <span>Daily Pro quota and top-up credits are used up. Resets at midnight UTC.</span>
                  <div className="flex items-center gap-2">
                    <a
                      href="/api/checkout/creem?type=pack"
                      className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-85"
                    >
                      Top-up · $1 / {额度.plan === "PRO_YEARLY" ? 20 : 10} gens →
                    </a>
                    <a
                      href="/pricing"
                      className="rounded-full border border-black/15 px-4 py-1.5 text-xs font-medium text-zinc-600 transition hover:bg-zinc-100 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-800"
                    >
                      Manage subscription
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <span>Daily free quota (1 generation) used up. Resets at midnight UTC.</span>
                  <a
                    href="/pricing"
                    className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:opacity-85"
                  >
                    Upgrade Pro · 10 generations/day →
                  </a>
                </>
              )
            ) : (
              "Nothing here yet. Fill in your product, pick platforms and tone, hit the button — your copy will show up here."
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
                    {已复制 === 序号 ? "✓ Copied" : "Copy"}
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
