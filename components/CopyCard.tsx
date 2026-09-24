"use client";

// ============================================================
// CopyCard —— 单条文案卡片（客户端组件）
//
// 设计要点：
// - 服务端组件 /history 拿到所有 Copy 数据，把每条传给 CopyCard
// - 卡片本身可交互：复制 + 收藏 + 编辑 + 删除
// - 状态变化后用 router.refresh() 让服务器组件重新拉数据
// - 编辑模式：textarea 替换显示文本，操作栏变"取消/保存"
// ============================================================

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

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

  // 编辑模式 state
  const [编辑中, 设置编辑中] = useState(false);
  const [编辑内容, 设置编辑内容] = useState(条.content);
  const [保存中, 设置保存中] = useState(false);
  const 编辑框引用 = useRef<HTMLTextAreaElement>(null);

  // 进入编辑模式：自动聚焦 + 光标移到末尾 + 绑键盘快捷键
  useEffect(() => {
    if (!编辑中) return;
    if (编辑框引用.current) {
      const ta = 编辑框引用.current;
      ta.focus();
      ta.setSelectionRange(ta.value.length, ta.value.length);
    }

    function 键盘(e: KeyboardEvent) {
      // Esc → 取消编辑
      if (e.key === "Escape") {
        e.preventDefault();
        取消编辑();
      }
      // Cmd/Ctrl + Enter → 保存
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        保存编辑();
      }
    }
    window.addEventListener("keydown", 键盘);
    return () => window.removeEventListener("keydown", 键盘);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [编辑中, 编辑内容]);

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
      路由.refresh();
    } catch (错误) {
      alert(错误 instanceof Error ? 错误.message : "网络异常");
    } finally {
      设置删除中(false);
    }
  }

  // 进入编辑模式
  function 进入编辑() {
    设置编辑内容(条.content); // 重置回原内容（防用户上次没保存）
    设置编辑中(true);
  }

  // 取消编辑：丢弃修改
  function 取消编辑() {
    设置编辑内容(条.content);
    设置编辑中(false);
  }

  // 保存编辑：调 PUT → 成功后 router.refresh() → 退出编辑模式
  async function 保存编辑() {
    const 修剪后 = 编辑内容.trim();
    if (修剪后.length === 0) {
      alert("文案内容不能为空");
      return;
    }
    if (修剪后 === 条.content.trim()) {
      // 没改东西，直接退出
      设置编辑中(false);
      return;
    }

    设置保存中(true);
    try {
      const 响应 = await fetch(`/api/copies/${条.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: 修剪后 }),
      });
      if (!响应.ok) {
        const 数据 = await 响应.json().catch(() => ({}));
        throw new Error(数据.error || "保存失败");
      }
      路由.refresh();
      设置编辑中(false);
    } catch (错误) {
      alert(错误 instanceof Error ? 错误.message : "网络异常");
    } finally {
      设置保存中(false);
    }
  }

  // 文案超过 200 字默认折叠，点击展开/收起（编辑模式下不折叠）
  const 太长 = !编辑中 && 条.content.length > 200;
  const 显示内容 = 太长 && !展开 ? 条.content.slice(0, 200) + "…" : 条.content;
  const 字数 = 编辑内容.length;

  return (
    <article className="rounded-xl border border-black/10 p-4 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30">
      {/* 头部：时间 + 平台/风格标签 + 编辑模式提示 */}
      <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
        <span>{new Date(条.createdAt).toLocaleString("zh-CN")}</span>
        <div className="flex items-center gap-2">
          {编辑中 && (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
              ✏️ 编辑中
            </span>
          )}
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {条.platform}
          </span>
          <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
            {条.style}
          </span>
        </div>
      </div>

      {/* 正文 / 编辑框 */}
      {编辑中 ? (
        <div>
          <textarea
            ref={编辑框引用}
            value={编辑内容}
            onChange={(e) => 设置编辑内容(e.target.value)}
            rows={Math.min(15, Math.max(4, 编辑内容.split("\n").length + 1))}
            maxLength={5000}
            disabled={保存中}
            className="w-full resize-y rounded-lg border border-amber-300 bg-amber-50/50 px-3 py-2 text-sm leading-6 text-black outline-none focus:border-amber-500 disabled:opacity-50 dark:border-amber-700 dark:bg-amber-950/20 dark:text-zinc-100"
          />
          <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>{字数} / 5000 字</span>
            <span>Cmd/Ctrl + Enter 保存，Esc 取消</span>
          </div>
        </div>
      ) : (
        <>
          <p className="whitespace-pre-wrap text-sm leading-6 text-black dark:text-zinc-100">
            {显示内容}
          </p>
          {太长 && (
            <button
              type="button"
              onClick={() => 设置展开(!展开)}
              className="mt-1 text-xs text-zinc-500 underline hover:text-black dark:hover:text-zinc-200"
            >
              {展开 ? "收起" : "展开全文"}
            </button>
          )}
        </>
      )}

      {/* 底部操作栏（编辑模式 vs 浏览模式） */}
      {编辑中 ? (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-amber-200 pt-3 dark:border-amber-900">
          <button
            type="button"
            onClick={取消编辑}
            disabled={保存中}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            取消
          </button>
          <button
            type="button"
            onClick={保存编辑}
            disabled={保存中 || 编辑内容.trim().length === 0}
            className="rounded-lg bg-amber-500 px-3 py-1 text-xs font-medium text-white transition-colors hover:bg-amber-600 disabled:opacity-50"
          >
            {保存中 ? "保存中…" : "✓ 保存"}
          </button>
        </div>
      ) : (
        <div className="mt-3 flex items-center justify-end gap-2 border-t border-black/5 pt-3 dark:border-white/10">
          {/* 复制 */}
          <button
            type="button"
            onClick={复制}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-white/20 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            {已复制 ? "✓ 已复制" : "📋 复制"}
          </button>

          {/* 收藏 */}
          <button
            type="button"
            onClick={切收藏}
            disabled={收藏中}
            className="rounded-lg border border-black/15 px-3 py-1 text-xs transition-colors hover:bg-zinc-50 disabled:opacity-50 dark:border-white/20 dark:hover:bg-zinc-900"
          >
            {条.isFavorite ? "❤️ 已收藏" : "🤍 收藏"}
          </button>

          {/* 编辑（新增） */}
          <button
            type="button"
            onClick={进入编辑}
            className="rounded-lg border border-amber-200 px-3 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-50 dark:border-amber-900/50 dark:text-amber-400 dark:hover:bg-amber-950/30"
          >
            ✏️ 编辑
          </button>

          {/* 删除（红色警示，置最后） */}
          <button
            type="button"
            onClick={删除}
            disabled={删除中}
            className="rounded-lg border border-red-200 px-3 py-1 text-xs text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            {删除中 ? "删除中…" : "🗑️ 删除"}
          </button>
        </div>
      )}
    </article>
  );
}
