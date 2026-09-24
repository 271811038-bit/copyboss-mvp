// ============================================================
// GET /api/checkout/creem —— 收银台"带路员"
//
// 定价页「升级 Pro」按钮指向这里。流程：
// 1. 用户点按钮 → 浏览器 GET 这个地址
// 2. 我们验证登录（没登录滚去注册页）
// 3. 服务端调 Creem API 创建结账会话（带上 userId 元数据 + 用户邮箱）
// 4. 302 跳到 Creem 收银台 → 用户付款
// 5. 付款成功 → Creem 发 webhook 到 /api/webhooks/creem → 用户变 PRO
//
// 为什么走服务端创建而不是静态支付链接：
// - 可以塞 metadata.userId（webhook 认人靠它，100% 准）
// - 可以预填用户邮箱（少打一次字，转化率高一点）
// - API key 只在服务端出现，永不暴露给浏览器
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET() {
  // ① 登录闸：没登录不能付钱（都不知道给谁开会员）
  const 会话 = await auth();
  if (!会话?.user?.id || !会话.user.email) {
    return NextResponse.redirect(new URL("/register", process.env.NEXTAUTH_URL ?? "https://mtboss.cn"));
  }

  // ② 配置闸：Creem 产品还没配好时，友好降级而不是 500
  const API_KEY = process.env.CREEM_API_KEY;
  const 产品ID = process.env.CREEM_PRODUCT_ID;
  if (!API_KEY || !产品ID) {
    return NextResponse.redirect(
      new URL("/pricing?error=payment_not_ready", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  // ③ 调 Creem API 创建结账会话
  //    测试 Key（creem_test_ 开头）必须走 test-api.creem.io，生产 Key 走 api.creem.io
  const API域名 = API_KEY.startsWith("creem_test_") ? "https://test-api.creem.io" : "https://api.creem.io";
  const 响应 = await fetch(`${API域名}/v1/checkouts`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      product_id: 产品ID,
      request_id: `mtboss_${会话.user.id}_${Date.now()}`, // 幂等追踪用
      success_url: `${process.env.NEXTAUTH_URL ?? "https://mtboss.cn"}/pricing?paid=1`,
      customer: { email: 会话.user.email },
      metadata: { userId: 会话.user.id }, // webhook 靠它认人
    }),
  });

  // ④ 拿到收银台地址就跳过去；拿不到降级回定价页
  const 数据 = await 响应.json().catch(() => null);

  if (!响应.ok || !数据?.checkout_url) {
    console.error("[Creem checkout] 创建结账会话失败", { 状态: 响应.status, 数据 });
    return NextResponse.redirect(
      new URL("/pricing?error=checkout_failed", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  return NextResponse.redirect(数据.checkout_url as string);
}
