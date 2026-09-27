// 注册 Server Action
// 设计目标：**没有 JS 也能注册登录**。
// React 的 <form action={...}> 是渐进增强：客户端 JS 正常时 React 拦截提交（体验顺滑）；
// JS 挂掉时（iOS 微信/Safari WebView 曾出现）浏览器原生 POST 到服务器，照样能走通。
"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { signIn } from "@/auth";

export async function registerAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const name = String(formData.get("name") || "").trim();

  // 基础校验（服务端为准，前端 required 只是第一道防线）
  if (!email || !password || password.length < 6) {
    redirect("/register?error=invalid");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: { email, hashedPassword, name: name || null },
      select: { id: true },
    });
  } catch (e: unknown) {
    const code = (e as { code?: string })?.code;
    if (code === "P2002") {
      redirect("/register?error=exists");
    }
    console.error("注册失败:", e);
    redirect("/register?error=server");
  }

  // 注册成功 → 立即登录并跳到生成页（Auth.js 会种下会话 cookie 再重定向）
  await signIn("credentials", { email, password, redirectTo: "/generate" });
}
