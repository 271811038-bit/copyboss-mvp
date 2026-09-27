// 登录 Server Action（无 JS 兜底，原理见 register/actions.ts）
"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const callbackUrl = String(formData.get("callbackUrl") || "/generate");

  let 登录失败 = false;
  try {
    // 成功时 Auth.js 内部会抛 NEXT_REDIRECT 重定向（不能吞掉，所以只捕 AuthError）
    await signIn("credentials", { email, password, redirectTo: callbackUrl });
  } catch (e) {
    if (e instanceof AuthError) {
      登录失败 = true;
    } else {
      throw e;
    }
  }

  if (登录失败) {
    redirect(
      `/login?error=credentials&callbackUrl=${encodeURIComponent(callbackUrl)}`
    );
  }
}
