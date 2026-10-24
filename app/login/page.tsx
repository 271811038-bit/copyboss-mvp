// 登录页（服务端组件 + Server Action 表单）
// 渐进增强：JS 正常时 React 接管提交；JS 挂掉时（iOS WebView 兼容问题）原生 POST 也能登录。
// 曾经的 useSearchParams + Suspense 结构已不需要——错误和 callbackUrl 都走服务端 searchParams。

import Link from "next/link";
import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; callbackUrl?: string }>;
}) {
  const { error, callbackUrl } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">欢迎回来</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          登录你的 CopyBoss 账号
        </p>

        {error === "credentials" && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            邮箱或密码不对，再试试
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          {/* 登录后要回跳的页面（从 /generate 307 过来时带上） */}
          <input type="hidden" name="callbackUrl" value={callbackUrl || "/generate"} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">密码</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="至少 6 位"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
          >
            登录
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          还没账号？
          <Link href="/register" className="text-black dark:text-white underline ml-1">
            注册一个
          </Link>
        </p>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        登录即表示你已阅读并同意我们的
        <Link href="/terms" className="mx-1 underline">服务条款</Link>与
        <Link href="/privacy" className="mx-1 underline">隐私政策</Link>
        · 客服：271811038@qq.com
      </p>
    </main>
  );
}
