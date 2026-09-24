"use client";

// ============================================================
// CopyCard —— 单条文案卡片（客户端组件）
//
// 设计要点：
// - 服务端组件 /history 拿到所有 Copy 数据，把每条传给 CopyCard
// - 卡片本身可交互：复制 + 收藏
// - 状态变化后用 router.refresh() 让服务器组件重新拉数据
// - 不存"正在收藏"的 state——点了就乐观更新，体验更顺
// ============================================================

import { useRouter } from "next/navigation";
import { useState } from "react";

type 一条文案 = {
  id: string;
  platform: string;
  style: string;
  content: string;
  isFavorite: boolean;
  createdAt: string; // ISO 字符串（从 DateTime 序列化过来的）
};

export default function CopyCard({ 条 }: { 条: 一条文案 }) {
  const 路由 = useRouter();
  const [展开, 设置展开] = useState(false);
  const [已复制, 设置已复制] = useState(false);
  const [收藏中, 设置收藏中] = useState(false);
  const [删除中, 设置删除中] = useState(false);

  // 复制按钮：把文案塞进剪贴板，2 秒后"已复制"提示自动消失
  async function 复制() {
    try {
      await navigator.clipboard.writeText(条.content);
      设置已复制(true);
      setTimeout(() => 设置已复制(false), 2000);
    } catch {
      // 极少数浏览器不允许剪贴板 API——给个兜底提示
      alert("复制失败，请手动选中复制");
    }
  }

  // 收藏按钮：调 API → 成功后 router.refresh() 让 /history 重新渲染
  async function 切收藏() {
    设置收藏中(true);
    try {
      const 响应 = await fetch(`/api/copies/${条.id}/favorite`, {
        method: "POST",
      });
      if (!响应.ok) throw new Error("操作失败");
      // 关键一行：让服务器组件重新拉数据，UI 自动同步
      路由.refresh();
    } catch (错误) {
      alert(错误 instanceof Error ? 错误.message : "网络异常");
    } finally {
      设置收藏中(false);
    }
  }

  // 删除按钮：二次确认（防误删）→ 调 DELETE → router.refresh()
  async function 删除() {
    const 确认 = window.confirm("确定删除这条文案？删除后无法恢复。");
    if (!确认) return;

    设置删除中(true);
    try {
      const 响应 = await fetch(`/api/copies/${条.id}`, {
        method: "DELETE",
      });
      if (!响应.ok) {
        const 数据 = await 响应.json().catch(() => ({}));
        throw new Error(数据.error || "删除失败");
      }
      // 让服务器组件重新拉数据——这条文案从列表消失
      路由.refresh();
    } catch (错误) {
      alert(错误 instanceof Error ? 错误.message : "网络异常");
    } finally {
      设置删除中(false);
    }
  }

  // 文案超过 200 字默认折叠，点击展开/收起
  const 太长 = 条.content.length > 200;
  const 显示内容 = 太长 && !展开 ? 条.content.slice(0, 200) + "…" : 条.content;

  return (
    <article className="rounded-xl border border-black/10 p-4 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30">
      {/* 头部：时间 + 平台/风格标签 + 操作按钮 */}
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{new Date(条.createdAt).toLocaleString("zh-CN")}</span>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {条.platform}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {条.style}
          </span>
        </div>
      </div>

      {/* 正文 */}
      <p className="whitespace-pre-wrap text-sm leading-6 text-black dark:text-zinc-100">
        {显示内容}
      </p>

      {/* 展开/收起（仅过长文案显示） */}
      {太长 && (
        <button
          type="button"
          onClick={() => 设置展开(!展开)}
          className="mt-1 text-xs text-zinc-500 underline hover:text-black dark:hover:text-zinc-200"
        >
          {展开 ? "收起" : "展开全文"}
        </button>
      )}

      {/* 底部操作栏 */}
      <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/5 pt-3 dark:border-white/10">
        {/* 复制按钮 */}
        <button
          type="button"
          onClick={复制}
          className="rounded-lg border border-black/15 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-900"
        >
          {已复制 ? "✓ 已复制" : "📋 复制"}
        </button>

        {/* 收藏按钮 */}
        <button
          type="button"
          onClick={切收藏}
          disabled={收藏中}
          className="rounded-lg border border-black/15 px-3 py-1 text-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-white/20 dark:hover:bg-zinc-900"
        >
          {条.isFavorite ? "❤️ 已收藏" : "🤍 收藏"}
        </button>

        {/* 删除按钮（红色警示，置最后） */}
        <button
          type="button"
          onClick={删除}
          disabled={删除中}
          className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
        >
          {删除中 ? "删除中…" : "🗑️ 删除"}
        </button>
      </div>
    </article>
  );
}