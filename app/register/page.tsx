// 注册页：填邮箱 + 密码 + 名字 → 调 API → 自动登录

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [错误, 设置错误] = useState<string | null>(null);
  const [加载中, 设置加载中] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    设置错误(null);
    设置加载中(true);

    // 第 1 步：调注册 API 创建账号
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });

    if (!res.ok) {
      const data = await res.json();
      设置错误(data.error || "注册失败");
      设置加载中(false);
      return;
    }

    // 第 2 步：注册成功，立即登录（用户不用再点一次登录）
    const 登录结果 = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    设置加载中(false);

    if (登录结果?.error) {
      设置错误("注册成功但登录失败，请去登录页手动登录");
    } else {
      router.push("/generate");
      router.refresh();
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 bg-zinc-50 dark:bg-black">
      <div className="w-full max-w-sm rounded-xl border border-black/10 dark:border-white/15 bg-white dark:bg-zinc-900 p-8 shadow-sm">
        <h1 className="text-2xl font-semibold mb-2">加入 CopyBoss</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          创建账号，开始生成你的文案
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">名字（选填）</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="想被怎么称呼？"
              className="rounded-lg border border-black/15 dark:border-white/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-black dark:focus:border-white"
            />
          </label>

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
              minLength={6}
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
            {加载中 ? "创建中..." : "创建账号"}
          </button>
        </form>

        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-6 text-center">
          已经有账号？
          <Link href="/login" className="text-black dark:text-white underline ml-1">
            去登录
          </Link>
        </p>
      </div>
    </main>
  );
}