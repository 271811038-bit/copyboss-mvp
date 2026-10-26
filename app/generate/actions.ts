"use server";

// ============================================================
// 生成文案的 Server Action（无 JS 兜底版核心）
//
// 为什么存在这个文件：部分 iPhone（含 iOS 微信 WebView）上页面 JS
// 完全不执行，fetch/onClick 全部失灵。改用 React Server Action 的
// 渐进增强：JS 正常时拦截提交；JS 挂掉时浏览器原生 POST 表单，
// 服务器完成生成 + 存库 + 返回整页新 HTML（结果直接渲染出来）。
// 逻辑与 /api/generate 完全一致（保留该 API 供其他调用方）。
//
// 2026-10-26 改版：额度从"按点击"改为"按组合"计费
//   1 credit = 1 平台 × 1 风格 = 3 条文案
//   勾 2 平台 × 2 风格 = 4 credits = 12 条
// ============================================================

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { 生成文案 } from "@/lib/ai";
import { 查额度, 结算加油包, 今日已用额度, 每额度条数 } from "@/lib/limits";
import type { 生成结果状态 } from "./types";

// 每个「平台 × 风格」组合生成几条（3 条质量更集中，也把等待时间压到 1/3）
const 每组条数 = 每额度条数;

// 并发度：一次最多同时跑 4 个组合，兼顾速度与 DeepSeek 限流
const 并发度 = 4;

export async function 生成文案Action(
  _之前: 生成结果状态,
  formData: FormData
): Promise<生成结果状态> {
  // ① 验明正身
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return {
      error: "Your session has expired. Please log in again.",
      文案们: [],
      错误们: [],
      额度: null,
    };
  }

  // ② 读原生表单字段（checkbox 多选 = getAll 拿数组）
  let 产品 = String(formData.get("product") ?? "");
  const 平台们 = formData.getAll("platform").map(String);
  const 风格们 = formData.getAll("style").map(String);
  const 语言 = String(formData.get("language") ?? "auto");

  // ③ 参数体检（无 JS 时浏览器原生校验可能被绕过，服务端必须把住）
  if (
    平台们.length === 0 ||
    风格们.length === 0 ||
    产品.trim().length < 5
  ) {
    return {
      error: "Pick at least 1 platform and 1 tone, and write a product description of at least 5 characters.",
      文案们: [],
      错误们: [],
      额度: null,
    };
  }
  if (产品.length > 500) 产品 = 产品.slice(0, 500);

  // 本次需要多少 credits = 平台数 × 风格数
  const 需要额度 = 平台们.length * 风格们.length;

  // ④ 额度闸（前端永远不能信）
  const 额度检查 = await 查额度(会话.user.id);
  if (额度检查.剩余 < 需要额度) {
    const 提示 =
      额度检查.剩余 <= 0
        ? 额度检查.plan === "FREE"
          ? `Your daily free credit (1) is used up. Resets at midnight UTC — upgrade to Pro for 10 credits/day.`
          : `Your daily ${额度检查.总数} credits and top-up credits are all used up. Resets at midnight UTC — or grab a top-up pack.`
        : `This selection needs ${需要额度} credits (${平台们.length} platform${平台们.length > 1 ? "s" : ""} × ${风格们.length} tone${风格们.length > 1 ? "s" : ""}), but you only have ${额度检查.剩余} left. Uncheck some platforms/tones, or upgrade.`;

    return {
      error: 提示,
      文案们: [],
      错误们: [],
      额度: {
        plan: 额度检查.plan,
        已用: 额度检查.已用,
        剩余: 额度检查.剩余,
        总数: 额度检查.总数,
        超额: 额度检查.超额,
        加油包剩余: 额度检查.加油包剩余,
        当日剩余: 额度检查.当日剩余,
      },
    };
  }

  // ⑤ 并发跑组合（平台 × 风格 = 一个任务，每个任务 3 条）
  // P1：带上用户保存的品牌声音（有则注入 prompt，无则跳过）
  const 用户档案 = await prisma.user.findUnique({
    where: { id: 会话.user.id },
    select: { brandVoice: true },
  });
  const 任务们 = 平台们.flatMap((平台) => 风格们.map((风格) => ({ 平台, 风格 })));
  const 结果表: {
    平台: string;
    风格: string;
    结果: Awaited<ReturnType<typeof 生成文案>> | null;
  }[] = 任务们.map((任务) => ({ ...任务, 结果: null }));

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
          语言,
          品牌声音: 用户档案?.brandVoice || undefined,
        });
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

  // ⑥ 汇总结果（成功的组合才计费）
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
    结果.文案.forEach((内容) =>
      存库结果.push({ 平台: 项.平台, 风格: 项.风格, 内容 })
    );
  }

  // ⑦ 存库 + 写 Generation 日志（creditCount = 成功组合数 = 实际扣的额度）
  const 已用前 = 额度检查.已用;
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

  // ⑧ 超出当日额度的部分，从加油包扣
  if (已用后 > 已用前) {
    await 结算加油包(会话.user.id, 已用前, 已用后);
    // 以防并发请求导致统计偏差，最终以数据库为准重算一次
    已用后 = await 今日已用额度(会话.user.id);
  }

  const 新额度 = await 查额度(会话.user.id);

  return {
    error:
      存库结果.length === 0
        ? `Generation failed: ${错误们.join("; ") || "please try again later"}`
        : "",
    文案们: 存库结果,
    错误们,
    额度: {
      plan: 新额度.plan,
      已用: 新额度.已用,
      剩余: 新额度.剩余,
      总数: 新额度.总数,
      超额: 新额度.超额,
      加油包剩余: 新额度.加油包剩余,
      当日剩余: 新额度.当日剩余,
    },
    消耗: 成功组合数,
  };
}

// ============================================================
// P1：保存品牌声音（Brand Voice）
// 独立 action，不占用生成额度；存到 User.brandVoice，之后每次
// 生成自动注入 prompt。清空文本框保存 = 删除品牌声音。
// ============================================================
export async function 保存品牌声音Action(
  _之前: { saved: boolean; error: string },
  formData: FormData
): Promise<{ saved: boolean; error: string }> {
  const 会话 = await auth();
  if (!会话?.user?.id) {
    return { saved: false, error: "Your session has expired. Please log in again." };
  }

  const 文本 = String(formData.get("brandVoice") ?? "").trim().slice(0, 2000);

  await prisma.user.update({
    where: { id: 会话.user.id },
    data: { brandVoice: 文本 || null },
  });

  return { saved: true, error: "" };
}
