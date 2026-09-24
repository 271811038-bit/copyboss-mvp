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
import { 是否超额, 今日生成次数, 剩余次数, 每日免费次数 } from "@/lib/limits";

// 每种「平台 × 风格」组合生成几条
const 每组条数 = 5;

export async function POST(请求: Request) {
  // ① 验明正身：auth() 会读 cookie 里的 session，确认你是谁
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  // ② 额度闸：今天用过 5 次就拒（防薅羊毛，保护 DeepSeek API 成本）
  //    即使前端做了置灰，API 也要独立校验——前端永远不能信
  if (await 是否超额(会话.user.id)) {
    const 已用 = await 今日生成次数(会话.user.id);
    return NextResponse.json(
      {
        error: `今日 ${已用} 次额度已用完（上限 ${每日免费次数} 次），明天 0 点（北京时间）自动重置`,
        错误们: ["额度已用完"],
        已用,
        剩余: await 剩余次数(会话.user.id),
        超额: true,
      },
      { status: 429 } // 429 Too Many Requests 是 HTTP 规范里的"超频"
    );
  }

  // ③ 参数体检
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

  // ④ 逐组生成（平台 × 风格 = 一组，每组出 5 条）
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

  // ⑤ 先写文案，再写 Generation 日志（生成 1 次 = 1 条 log，无论多少文案）
  if (存库结果.length > 0) {
    await prisma.copy.createMany({
      data: 存库结果.map((条) => ({
        userId: 会话.user.id,
        platform: 条.平台,
        style: 条.风格,
        content: 条.内容,
      })),
    });

    // 关键：写 1 条 Generation 记录（这是"扣额度"的真实依据）
    await prisma.generation.create({
      data: {
        userId: 会话.user.id,
        platforms: JSON.stringify(平台们),
        styles: JSON.stringify(风格们),
        product: 产品.trim().slice(0, 200),
        copyCount: 存库结果.length,
      },
    });
  }

  // ⑥ 生成后查一次额度（一次性返回，避免前端再查）
  const 已用 = await 今日生成次数(会话.user.id);
  const 剩余 = Math.max(0, 每日免费次数 - 已用);

  return NextResponse.json({
    文案们: 存库结果,
    用的AI,
    错误们,
    已用,
    剩余,
    超额: 已用 >= 每日免费次数,
  });
}
