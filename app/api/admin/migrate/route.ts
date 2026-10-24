// ============================================================
// POST /api/admin/migrate —— 运维工具：执行受控的数据库结构变更
//
// 为什么存在：生产库连接串是 Vercel Sensitive 变量，本地拉不到，
// prisma migrate deploy 跑不了。改为部署后由管理员带密钥调这个
// 接口，在应用运行时（有真实 DATABASE_URL）执行受控 SQL。
//
// 安全：
// - 必须带 header x-admin-secret，值 = 环境变量 ADMIN_SECRET
// - 密钥不对 → 404
// - 只允许白名单里的幂等 SQL，不接受任意 SQL
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 幂等迁移清单：每条都可重复执行（IF NOT EXISTS）
const 迁移清单: { 名称: string; SQL: string }[] = [
  {
    名称: "User.extraCredits 加油包剩余次数",
    SQL: 'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "extraCredits" INTEGER NOT NULL DEFAULT 0',
  },
];

export async function POST(请求: Request) {
  const 密钥 = process.env.ADMIN_SECRET;
  const 提交密钥 = 请求.headers.get("x-admin-secret");

  if (!密钥 || !提交密钥 || 提交密钥 !== 密钥) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const 结果们: { 名称: string; 状态: string }[] = [];

  for (const 迁移 of 迁移清单) {
    try {
      await prisma.$executeRawUnsafe(迁移.SQL);
      结果们.push({ 名称: 迁移.名称, 状态: "ok" });
    } catch (错误) {
      console.error("[Admin migrate] 失败:", 迁移.名称, 错误);
      结果们.push({
        名称: 迁移.名称,
        状态: `失败: ${错误 instanceof Error ? 错误.message.slice(0, 200) : String(错误)}`,
      });
    }
  }

  // 验证字段确实存在
  let 字段确认 = false;
  try {
    const 样本 = await prisma.user.findFirst({ select: { extraCredits: true } });
    字段确认 = 样本 !== undefined;
  } catch {
    字段确认 = false;
  }

  console.log("[Admin migrate] 执行完成", { 结果们, 字段确认 });

  return NextResponse.json({ ok: true, 结果们, 字段确认 });
}
