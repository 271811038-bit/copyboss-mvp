"use server";

// ============================================================
// 生成文案的 Server Action（无 JS 兜底版核心）
//
// 为什么存在这个文件：部分 iPhone（含 iOS 微信 WebView）上页面 JS
// 完全不执行，fetch/onClick 全部失灵。改用 React Server Action 的
// 渐进增强：JS 正常时拦截提交；JS 挂掉时浏览器原生 POST 表单，
// 服务器完成生成 + 存库 + 返回整页新 HTML（结果直接渲染出来）。
// 逻辑与 /api/generate 完全一致（保留该 API 供其他调用方）。
// ============================================================

import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { 生成文案 } from "@/lib/ai";
import { 查额度, 扣加油包若超额 } from "@/lib/limits";
import type { 生成结果状态 } from "./types";

// 每种「平台 × 风格」组合生成几条（与 API 版一致）
const 每组条数 = 5;

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

  // ④ 额度闸（前端永远不能信）
  const 额度检查 = await 查额度(会话.user.id);
  if (额度检查.超额) {
    return {
      error:
        额度检查.plan === "PRO"
          ? `Your daily ${额度检查.总数} Pro generations and top-up credits are all used up. Resets at midnight UTC — or grab another top-up pack ($1 / 10 generations)`
          : `Your daily free quota (${额度检查.总数} generation) is used up. Resets automatically at midnight UTC — upgrade to Pro for 10 generations/day.`,
      文案们: [],
      错误们: [],
      额度: {
        plan: 额度检查.plan,
        已用: 额度检查.已用,
        剩余: 0,
        总数: 额度检查.总数,
        超额: true,
        加油包剩余: 额度检查.加油包剩余,
      },
    };
  }

  // ⑤ 逐组生成（平台 × 风格 = 一组，每组 5 条）——与 API 版同逻辑
  const 存库结果: { 平台: string; 风格: string; 内容: string }[] = [];
  const 错误们: string[] = [];

  for (const 平台 of 平台们) {
    for (const 风格 of 风格们) {
      const 结果 = await 生成文案({
        产品: 产品.trim(),
        平台,
        风格,
        数量: 每组条数,
      });

      if (!结果.ok) {
        错误们.push(`${平台}×${风格}: ${结果.原因}`);
        continue;
      }
      结果.文案.forEach((内容) => 存库结果.push({ 平台, 风格, 内容 }));
    }
  }

  // ⑥ 存库 + 写 Generation 日志（扣额度依据）
  if (存库结果.length > 0) {
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
      },
    });
  }

  // ⑦ 当日额度用尽时扣加油包（买过加油包的场景），再查一次最新额度一并返回
  await 扣加油包若超额(会话.user.id);
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
    },
  };
}
