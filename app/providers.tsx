// 全局 providers：让所有组件都能用 useSession()
// SessionProvider 是 NextAuth 提供的"全局会话状态容器"

"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}