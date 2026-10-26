// ============================================================
// POST /api/generate —— 生成文案的"总调度台"
//
// 职责：
// 1. 验明正身：没登录的请求直接打回（防止别人白嫖你的 AI 账单）
// 2. 参数体检 + 额度闸：按组合计费（1 credit = 1 平台 × 1 风格）
// 3. 并发派活给 AI 适配器（lib/ai.ts）
// 4. 结果先存数据库（Copy 表），再返回给前端
// ============================================================

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { 生成文案 } from "@/lib/ai";
import { 查额度, 结算加油包, 今日已用额度, 每额度条数 } from "@/lib/limits";

// 每个组合生成几条
const 每组条数 = 每额度条数;
// 并发度
const 并发度 = 4;

export async function POST(请求: Request) {
  // ① 验明正身
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return NextResponse.json({ error: "Please log in first" }, { status: 401 });
  }

  // ② 参数体检（先校验参数，再算需要多少额度）
  const { 平台们, 风格们, 产品, 语言 } = await 请求.json();
  if (
    !Array.isArray(平台们) ||
    !Array.isArray(风格们) ||
    平台们.length === 0 ||
    风格们.length === 0 ||
    typeof 产品 !== "string" ||
    产品.trim().length < 5
  ) {
    return NextResponse.json(
      {
        error:
          "Missing parameters: pick at least 1 platform and 1 tone, product description at least 5 characters",
      },
      { status: 400 }
    );
  }

  const 需要额度 = 平台们.length * 风格们.length;

  // ③ 额度闸：按组合计费，前端永远不能信
  const 额度 = await 查额度(会话.user.id);
  if (额度.剩余 < 需要额度) {
    return NextResponse.json(
      {
        error:
          额度.剩余 <= 0
            ? `Your daily quota and top-up credits are used up. Resets at midnight UTC.`
            : `This selection needs ${需要额度} credits but you only have ${额度.剩余} left.`,
        错误们: ["额度不足"],
        已用: 额度.已用,
        剩余: 额度.剩余,
        总数: 额度.总数,
        超额: 额度.超额,
        plan: 额度.plan,
        需要: 需要额度,
      },
      { status: 429 }
    );
  }

  // ④ 并发生成（平台 × 风格 = 一个任务）；带上品牌声音与输出语言
  const 用户档案 = await prisma.user.findUnique({
    where: { id: 会话.user.id },
    select: { brandVoice: true },
  });
  const 任务们 = 平台们.flatMap((平台: string) =>
    风格们.map((风格: string) => ({ 平台, 风格 }))
  );
  const 结果表: {
    平台: string;
    风格: string;
    结果: Awaited<ReturnType<typeof 生成文案>> | null;
  }[] = 任务们.map((任务: { 平台: string; 风格: string }) => ({
    ...任务,
    结果: null,
  }));

  let 用的AI: "deepseek" | "mock" = "mock";
  let 指针 = 0;
  async function 工人() {
    while (true) {
      const 序号 = 指针++;
      if (序号 >= 任务们.length) return;
      const { 平台, 风格 } = 任务们[序号];
      try {
        结果表[序号].结果 = await 生成文案({
          产品: 产品.trim(),
          平台,
          风格,
          数量: 每组条数,
          语言: typeof 语言 === "string" ? 语言 : "auto",
          品牌声音: 用户档案?.brandVoice || undefined,
        });
        if (结果表[序号].结果?.ok) {
          用的AI = 结果表[序号].结果!.用的AI;
        }
      } catch (错误) {
        结果表[序号].结果 = {
          ok: false,
          原因: 错误 instanceof Error ? 错误.message : "unknown error",
        } as Awaited<ReturnType<typeof 生成文案>>;
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(并发度, 任务们.length) }, () => 工人())
  );

  // ⑤ 汇总（只对成功的组合计费）
  const 存库结果: { 平台: string; 风格: string; 内容: string }[] = [];
  const 错误们: string[] = [];
  let 成功组合数 = 0;

  for (const 项 of 结果表) {
    const 结果 = 项.结果;
    if (!结果 || !结果.ok) {
      错误们.push(`${项.平台}×${项.风格}: ${结果 && !结果.ok ? 结果.原因 : "failed"}`);
      continue;
    }
    成功组合数 += 1;
    结果.文案.forEach((内容: string) =>
      存库结果.push({ 平台: 项.平台, 风格: 项.风格, 内容 })
    );
  }

  // ⑥ 存库 + Generation 日志
  const 已用前 = 额度.已用;
  let 已用后 = 已用前;

  if (存库结果.length > 0 && 成功组合数 > 0) {
    await prisma.copy.createMany({
      data: 存库结果.map((条) => ({
        userId: 会话.user.id,
        platform: 条.平台,
        style: 条.风格,
        content: 条.内容,
      })),
    });

    await prisma.generation.create({
      data: {
        userId: 会话.user.id,
        platforms: JSON.stringify(平台们),
        styles: JSON.stringify(风格们),
        product: 产品.trim().slice(0, 200),
        copyCount: 存库结果.length,
        creditCount: 成功组合数,
      },
    });

    已用后 = 已用前 + 成功组合数;
  }

  // ⑦ 超出当日额度的部分从加油包扣
  if (已用后 > 已用前) {
    await 结算加油包(会话.user.id, 已用前, 已用后);
    已用后 = await 今日已用额度(会话.user.id);
  }

  const 新额度 = await 查额度(会话.user.id);

  return NextResponse.json({
    文案们: 存库结果,
    用的AI,
    错误们,
    已用: 新额度.已用,
    剩余: 新额度.剩余,
    总数: 新额度.总数,
    超额: 新额度.超额,
    plan: 新额度.plan,
    加油包剩余: 新额度.加油包剩余,
    消耗: 成功组合数,
  });
}
