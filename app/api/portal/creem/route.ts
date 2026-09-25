// ============================================================
// GET /api/portal/creem —— 订阅管理"传送门"
//
// Pro 用户点「管理订阅」按钮 → 走到这里：
// 1. 验证登录（没登录滚去登录页）
// 2. 查用户有没有 Creem 客户 ID（付过款才有）
// 3. 调 Creem API 生成客户门户临时链接（一次性，带有效期）
// 4. 302 跳过去 → 用户在 Creem 官方门户自助取消/换卡/看账单
//
// 为什么不自己写"取消订阅"页面：
// - Creem 是 MoR（商家记录），支付信息全在 Creem 侧
// - 官方门户自带取消/暂停/换支付方式/下载账单，安全合规零开发
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  // ① 登录闸
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.redirect(
      new URL("/login?callbackUrl=/pricing", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  // ② 查用户的 Creem 客户 ID（付款成功时 webhook 写入的）
  const 用户 = await prisma.user.findUnique({
    where: { id: 会话.user.id },
    select: { plan: true, lsCustomerId: true },
  });

  if (!用户?.lsCustomerId) {
    // 没付过款 → 没有可管理的订阅，回定价页
    return NextResponse.redirect(
      new URL("/pricing?error=no_subscription", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  // ③ 配置闸
  const API_KEY = process.env.CREEM_API_KEY;
  if (!API_KEY) {
    return NextResponse.redirect(
      new URL("/pricing?error=payment_not_ready", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  // ④ 生成门户链接（测试 Key 走 test-api，与 checkout 同规则）
  const API域名 = API_KEY.startsWith("creem_test_")
    ? "https://test-api.creem.io"
    : "https://api.creem.io";

  const 响应 = await fetch(`${API域名}/v1/customers/billing`, {
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ customer_id: 用户.lsCustomerId }),
  });

  const 数据 = await 响应.json().catch(() => null);

  if (!响应.ok || !数据?.customer_portal_link) {
    console.error("[Creem portal] 生成门户链接失败", { 状态: 响应.status, 数据 });
    return NextResponse.redirect(
      new URL("/pricing?error=portal_failed", process.env.NEXTAUTH_URL ?? "https://mtboss.cn")
    );
  }

  // ⑤ 跳转到 Creem 客户门户
  return NextResponse.redirect(数据.customer_portal_link as string);
}
