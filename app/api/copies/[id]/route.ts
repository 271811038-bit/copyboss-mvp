// ============================================================
// /api/copies/[id] —— 单条文案的 CRUD（除 POST 外）
//
// DELETE 已实现，PUT 已实现
// 3 道闸跟 favorite 保持一致：登录 → 存在 → 归属
// 教学点：HTTP 5 大动词 GET/POST/PUT/PATCH/DELETE 至此全部用上了
// 这是 RESTful API 设计的基础设施
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

// PUT /api/copies/[id] —— 修改文案内容
// Body: { content: string }
export async function PUT(
  请求: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // ① 验登录
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  const { id } = await params;

  // ② 参数体检
  const body = await 请求.json().catch(() => ({}));
  const { content } = body;
  if (typeof content !== "string" || content.trim().length === 0) {
    return NextResponse.json(
      { error: "文案内容不能为空" },
      { status: 400 }
    );
  }
  if (content.length > 5000) {
    return NextResponse.json(
      { error: "文案过长（最多 5000 字）" },
      { status: 400 }
    );
  }

  // ③ 验存在 + 归属（合二为一，减少一次查询）
  const 现有 = await prisma.copy.findUnique({
    where: { id },
    select: { userId: true },
  });

  if (!现有) {
    return NextResponse.json({ error: "文案不存在" }, { status: 404 });
  }
  if (现有.userId !== 会话.user.id) {
    return NextResponse.json({ error: "无权编辑此文案" }, { status: 403 });
  }

  // ④ 真改（prisma.copy.update 只更新指定字段，其他字段不动）
  const 更新后 = await prisma.copy.update({
    where: { id },
    data: { content: content.trim() },
    select: { id: true, content: true, createdAt: true },
  });

  return NextResponse.json({
    ok: true,
    id: 更新后.id,
    content: 更新后.content,
    createdAt: 更新后.createdAt.toISOString(),
  });
}

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