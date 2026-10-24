// 注册页（服务端组件 + Server Action 表单）
// 渐进增强：JS 正常时 React 接管提交；JS 挂掉时原生 POST 也能完成注册+自动登录。
// 错误提示通过 ?error= 查询参数服务端渲染（不依赖 JS）。

import Link from "next/link";
import { registerAction } from "./actions";

const 错误文案: Record<string, string> = {
  invalid: "邮箱或密码格式不对（密码至少 6 位），请检查后重试。",
  exists: "这个邮箱已经注册过了，直接去登录吧。",
  server: "服务器开小差了，请稍后再试。",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">加入 CopyBoss</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          创建账号，开始生成你的文案
        </p>

        {error && 错误文案[error] && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-950 dark:text-red-400">
            {错误文案[error]}
          </p>
        )}

        <form action={registerAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">名字（选填）</span>
            <input
              type="text"
              name="name"
              placeholder="想被怎么称呼？"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              name="email"
              required
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
              minLength={6}
              placeholder="至少 6 位"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <button
            type="submit"
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-85"
          >
            创建账号
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          已经有账号？
          <Link href="/login" className="text-black dark:text-white underline ml-1">
            去登录
          </Link>
        </p>
      </div>

      {/* 条款声明：注册即同意 */}
      <p className="mt-6 max-w-sm text-center text-xs leading-5 text-zinc-400 dark:text-zinc-500">
        创建账号即表示你已阅读并同意我们的
        <Link href="/terms" className="mx-1 underline">服务条款</Link>、
        <Link href="/privacy" className="mx-1 underline">隐私政策</Link>与
        <Link href="/acceptable-use" className="mx-1 underline">可接受使用政策</Link>
        · 客服：271811038@qq.com
      </p>
    </main>
  );
}
