// 注册页（服务端组件 + Server Action 表单）
// 渐进增强：JS 正常时 React 接管提交；JS 挂掉时原生 POST 也能完成注册+自动登录。
// 错误提示通过 ?error= 查询参数服务端渲染（不依赖 JS）。

import Link from "next/link";
import { registerAction } from "./actions";

const 错误文案: Record<string, string> = {
  invalid: "Invalid email or password format (password must be at least 6 characters).",
  exists: "This email is already registered — try logging in instead.",
  server: "Something went wrong on our end. Please try again later.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="page-aurora flex min-h-screen flex-col items-center justify-center px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-2xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-8 shadow-xl shadow-fuchsia-500/10">
        <h1 className="text-2xl font-semibold mb-2">
          Join <span className="brand-text">CopyBoss</span>
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          Create an account and start generating copy
        </p>

        {error && 错误文案[error] && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {错误文案[error]}
          </p>
        )}

        <form action={registerAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Name (optional)</span>
            <input
              type="text"
              name="name"
              placeholder="What should we call you?"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              type="email"
              name="email"
              required
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
              minLength={6}
              placeholder="Min 6 characters"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 via-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/25 transition-all hover:opacity-90 hover:shadow-lg hover:shadow-fuchsia-500/35"
          >
            Create account
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          Already have an account?
          <Link href="/login" className="text-black dark:text-white underline ml-1">
            Log in
          </Link>
        </p>
      </div>

      {/* 条款声明：注册即同意 */}
      <p className="mt-6 max-w-sm text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        By creating an account you agree to our
        <Link href="/terms" className="mx-1 underline">Terms of Service</Link>,
        <Link href="/privacy" className="mx-1 underline">Privacy Policy</Link> and
        <Link href="/acceptable-use" className="mx-1 underline">Acceptable Use Policy</Link>
        · Support: 271811038@qq.com
      </p>
    </main>
  );
}
