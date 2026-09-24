// 登录页（服务端壳）
// 唯一职责：用 <Suspense> 包住 LoginForm。
// 原因：LoginForm 里用了 useSearchParams()，生产构建静态预渲染时
// React 要求这类"读 URL 的客户端钩子"必须包在 Suspense 边界里，
// 否则整个页面没法预渲染，构建直接失败（Error occurred prerendering page "/login"）。
// 本地 dev 不做预渲染所以从来没暴露过 —— 这是典型的"本地好好的、上线就炸"。

import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
