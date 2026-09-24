// 登录表单（客户端组件）
// 注意：useSearchParams 在生产构建时必须被 <Suspense> 包住（见 page.tsx），
// 否则 Next.js 静态预渲染会报错。这就是为什么要拆成两个文件。

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // 用户原本想去的页面（比如 /generate）。登录成功后跳回去
  const callbackUrl = searchParams.get("callbackUrl") || "/generate";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [错误, 设置错误] = useState<string | null>(null);
  const [加载中, 设置加载中] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    设置错误(null);
    设置加载中(true);

    const 结果 = await signIn("credentials", {
      email,
      password,
      redirect: false,  // 我们自己处理跳转，不让 next-auth 自动跳
    });

    设置加载中(false);

    if (结果?.error) {
      设置错误("邮箱或密码不对，再试试");
    } else {
      router.push(callbackUrl);
      router.refresh();  // 刷新当前页面，让导航栏拿到新登录状态
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">欢迎回来</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          登录你的 CopyBoss 账号
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">邮箱</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">密码</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 位"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

          {错误 && (
            <p className="text-sm text-red-600 dark:text-red-400">{错误}</p>
          )}

          <button
            type="submit"
            disabled={加载中}
            className="rounded-lg bg-black dark:bg-white text-white dark:text-black px-4 py-2 text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50"
          >
            {加载中 ? "登录中..." : "登录"}
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          还没账号？
          <Link href="/register" className="text-black dark:text-white underline ml-1">
            注册一个
          </Link>
        </p>
      </div>
    </main>
  );
}