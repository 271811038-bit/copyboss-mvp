// ============================================================
// POST /api/copies/[id]/favorite —— 切换收藏状态
//
// 设计：不是「设为收藏」「取消收藏」两个动作，而是「切换」一个动作
// 这样前端按钮逻辑极简：点一下 → POST → 服务端判断新状态 → 返回
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(
  _请求: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ① 验登录
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // ② 验归属：先找记录，且必须属于当前用户（防越权操作别人的文案）
  const 现有 = await prisma.copy.findUnique({
    where: { id },
    select: { userId: true, isFavorite: true },
  });

  if (!现有) {
    return NextResponse.json({ error: "文案不存在" }, { status: 404 });
  }
  if (现有.userId !== 会话.user.id) {
    // 这条返回 403 而不是 404——更精准地告诉前端"你没权限"
    return NextResponse.json({ error: "无权操作此文案" }, { status: 403 });
  }

  // ③ 切换收藏状态（!取反）
  const 更新后 = await prisma.copy.update({
    where: { id },
    data: { isFavorite: !现有.isFavorite },
    select: { isFavorite: true },
  });

  return NextResponse.json({ ok: true, isFavorite: 更新后.isFavorite });
}