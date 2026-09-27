// 微信内置浏览器检测引导条
// 背景：微信 WebView 对登录 Cookie 的处理和标准浏览器有差异，
// 部分用户在微信内注册/登录会失败。检测到微信 UA 就显示引导，让用户跳系统浏览器。
"use client";

import { useState, useEffect } from "react";

export default function WeChatGuide() {
  const [微信内, 设置微信内] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    // 微信内置浏览器 UA 含 MicroMessenger；企业微信含 wxwork
    设置微信内(/MicroMessenger/i.test(ua) && !/wxwork/i.test(ua));
  }, []);

  if (!微信内) return null;

  return (
    <div className="mb-4 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
      <p className="font-medium">📱 你正在微信内打开本站</p>
      <p className="mt-1">
        微信内置浏览器可能导致注册/登录异常。如遇问题，请点击右上角
        <strong>「···」</strong> → 选择
        <strong>「在浏览器打开」</strong>
        ，体验更流畅。
      </p>
    </div>
  );
}
