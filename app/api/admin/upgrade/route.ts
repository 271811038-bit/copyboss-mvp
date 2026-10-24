// ============================================================
// POST /api/admin/upgrade —— 运维保底工具：手动把某用户升级为 PRO
//
// 使用场景：webhook 验签失败导致真实付款没生效时，人工补单。
// 正常情况下不会用到——付款升级应走 /api/webhooks/creem。
//
// 安全：
// - 必须带 header `x-admin-secret`，值等于环境变量 ADMIN_SECRET
// - 密钥不存在或对不上 → 404（不暴露这个端点的存在）
// - 幂等：重复调用结果一致
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(请求: Request) {
  const 密钥 = process.env.ADMIN_SECRET;
  const 提交密钥 = 请求.headers.get("x-admin-secret");

  if (!密钥 || !提交密钥 || 提交密钥 !== 密钥) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  let 请求体: any;
  try {
    请求体 = await 请求.json();
  } catch {
    return NextResponse.json({ error: "请求体必须是 JSON" }, { status: 400 });
  }

  const 邮箱: string | undefined = 请求体?.email?.trim().toLowerCase();
  const 操作: "upgrade" | "downgrade" = 请求体?.action === "downgrade" ? "downgrade" : "upgrade";

  if (!邮箱) {
    return NextResponse.json({ error: "缺少 email 字段" }, { status: 400 });
  }

  const 用户 = await prisma.user.findUnique({ where: { email: 邮箱 } });
  if (!用户) {
    return NextResponse.json({ error: `用户不存在: ${邮箱}` }, { status: 404 });
  }

  await prisma.user.update({
    where: { id: 用户.id },
    data: {
      plan: 操作 === "upgrade" ? "PRO" : "FREE",
      ...(操作 === "upgrade" ? { lsSubscriptionStatus: "manual_upgrade" } : {}),
    },
  });

  console.log(`[Admin] 手动${操作 === "upgrade" ? "升级" : "降级"} ${邮箱} → ${操作 === "upgrade" ? "PRO" : "FREE"}`);

  return NextResponse.json({
    ok: true,
    email: 邮箱,
    plan: 操作 === "upgrade" ? "PRO" : "FREE",
    之前套餐: 用户.plan,
  });
}
