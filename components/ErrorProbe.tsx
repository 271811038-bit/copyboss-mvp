// JS 错误探针：捕获全局 JS 错误并上报
// 背景：iOS 微信 WebView 曾出现页面 JS 未正常启动导致注册表单原生提交（整页刷新）。
// 挂上这个探针后，任何未捕获错误都会 POST 到 /api/diag，在 Vercel 日志里可见，
// 这样即使用户远在千里之外，我们也能拿到真实报错。

"use client";

import { useEffect } from "react";

export default function ErrorProbe() {
  useEffect(() => {
    function 上报(类型: string, 信息: string, 附加?: string) {
      // 防抖：避免错误风暴打爆接口
      if ((window as any).__diagLast && Date.now() - (window as any).__diagLast < 3000) return;
      (window as any).__diagLast = Date.now();
      fetch("/api/diag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: 类型,
          message: (信息 || "").slice(0, 500),
          detail: (附加 || "").slice(0, 500),
          url: location.href,
          ua: navigator.userAgent,
        }),
      }).catch(() => {});
    }

    const onError = (e: ErrorEvent) =>
      上报("error", e.message, `${e.filename}:${e.lineno}`);
    const onReject = (e: PromiseRejectionEvent) =>
      上报("unhandledrejection", String(e.reason));

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onReject);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onReject);
    };
  }, []);

  return null;
}
