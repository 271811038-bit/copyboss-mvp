// 登录页（服务端组件 + Server Action 表单）
// 渐进增强：JS 正常时 React 接管提交；JS 挂掉时原生 POST 也能登录。

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
        <h1 className="text-2xl font-semibold mb-2">Welcome back</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Log in to your CopyBoss account
        </p>

        {error === "credentials" && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            Wrong email or password. Try again.
          </p>
        )}

        <form action={loginAction} className="flex flex-col gap-4">
          {/* 登录后要回跳的页面（从 /generate 307 过来时带上） */}
          <input type="hidden" name="callbackUrl" value={callbackUrl || "/generate"} />

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
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
            <span className="text-sm font-medium">Password</span>
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="Min 6 characters"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
          >
            Log in
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          No account yet?
          <Link href="/register" className="text-black dark:text-white underline ml-1">
            Sign up
          </Link>
        </p>
      </div>

      <p className="mt-6 max-w-sm text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        By logging in you agree to our
        <Link href="/terms" className="mx-1 underline">Terms of Service</Link> and
        <Link href="/privacy" className="mx-1 underline">Privacy Policy</Link>
        · Support: 271811038@qq.com
      </p>
    </main>
  );
}
