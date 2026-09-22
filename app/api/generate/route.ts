// ============================================================
// POST /api/generate —— 生成文案的"总调度台"
//
// 职责（对应之前架构图的第 2-5 步）：
// 1. 验明正身：没登录的请求直接打回（防止别人白嫖你的 AI 账单）
// 2. 参数体检：平台/风格/产品描述缺一样都不开工
// 3. 派活给 AI 适配器（lib/ai.ts）
// 4. 结果先存数据库（Copy 表），再返回给前端
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { 生成文案 } from "@/lib/ai";

// 每种「平台 × 风格」组合生成几条
const 每组条数 = 5;

export async function POST(请求: Request) {
  // ① 验明正身：auth() 会读 cookie 里的 session，确认你是谁
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // ② 参数体检
  const { 平台们, 风格们, 产品 } = await 请求.json();
  if (
    !Array.isArray(平台们) ||
    !Array.isArray(风格们) ||
    平台们.length === 0 ||
    风格们.length === 0 ||
    typeof 产品 !== "string" ||
    产品.trim().length < 5
  ) {
    return NextResponse.json(
      { error: "参数不完整：至少选 1 个平台、1 个风格，产品描述至少 5 个字" },
      { status: 400 }
    );
  }

  // ③ 逐组生成（平台 × 风格 = 一组，每组出 5 条）
  const 存库结果: { 平台: string; 风格: string; 内容: string }[] = [];
  const 错误们: string[] = [];
  let 用的AI: "deepseek" | "mock" = "mock";

  for (const 平台 of 平台们) {
    for (const 风格 of 风格们) {
      const 结果 = await 生成文案({ 产品: 产品.trim(), 平台, 风格, 数量: 每组条数 });

      if (!结果.ok) {
        错误们.push(`${平台}×${风格}：${结果.原因}`);
        continue; // 一组失败不影响其他组，能出多少出多少
      }

      用的AI = 结果.用的AI;
      结果.文案.forEach((内容) => 存库结果.push({ 平台, 风格, 内容 }));
    }
  }

  // ④ 先存库，再返回（历史记录的来源就是这一步）
  if (存库结果.length > 0) {
    await prisma.copy.createMany({
      data: 存库结果.map((条) => ({
        userId: 会话.user.id,
        platform: 条.平台,
        style: 条.风格,
        content: 条.内容,
      })),
    });
  }

  return NextResponse.json({
    文案们: 存库结果,
    用的AI,
    错误们,
  });
}
