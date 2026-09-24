// ============================================================
// DELETE /api/copies/[id] —— 删除单条文案
//
// 设计原则：3 道闸，跟 favorite API 保持一致
// ① 验登录（没登录直接 401）
// ② 验存在（不存在的 ID 直接 404）
// ③ 验归属（不是你的文案，403——绝不允许删别人家的）
//
// 教学点：HTTP 5 大动词 GET/POST/PUT/PATCH/DELETE 至此全部用上了
// 这是 RESTful API 设计的基础设施
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  _请求: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ① 验登录
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // ② 验存在 + ③ 验归属（合二为一，减少一次查询）
  const 现有 = await prisma.copy.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!现有) {
    return NextResponse.json({ error: "文案不存在" }, { status: 404 });
  }
  if (现有.userId !== 会话.user.id) {
    // 403 而非 404：精准告诉前端"你没权限"（不是"不存在"）
    return NextResponse.json({ error: "无权删除此文案" }, { status: 403 });
  }

  // ④ 真删
  await prisma.copy.delete({ where: { id } });

  return NextResponse.json({ ok: true, deletedId: id });
}