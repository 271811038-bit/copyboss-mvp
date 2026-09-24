// 用户额度管理
// 业务规则（2026-09-24 订阅版）：
//   FREE 免费版：每天 5 次生成（北京时间 0 点重置）
//   PRO 会员：  每天 30 次生成
// 收藏、删除、复制、查看历史 —— 都不计次数
//
// 设计决策：
// 1. 用独立的 Generation 表（不与 Copy 表耦合）
//    1 次请求可能产出 5/10/30 条文案，但只算 1 次额度（符合"按一次=一次"的直觉）
// 2. 时区用 UTC+8（北京时间），因为目标用户全在中国
// 3. 额度上限跟着用户的 plan 走（webhook 付费成功 → plan=PRO → 自动涨额度）

import { prisma } from "./db";

// 各档位的每日次数（改价/改额度只动这里）
export const 每日次数表: Record<string, number> = {
  FREE: 5,
  PRO: 30,
};

// 免费版每日次数（保留这个导出，历史代码还在用）
export const 每日免费次数 = 每日次数表.FREE;

// Pro 版每日次数
export const 每日Pro次数 = 每日次数表.PRO;

// 未知 plan 一律按免费处理（安全默认：宁可少给，不可多给）
export function 额度上限(plan: string | null | undefined): number {
  return 每日次数表[plan ?? "FREE"] ?? 每日次数表.FREE;
}

// 拿到"今天 0 点（北京时间）"对应的 UTC Date 对象
// 例：现在是 2026-09-24 15:00 北京 → 返回 2026-09-24 00:00 北京 = 2026-09-23 16:00 UTC
export function 今日零点UTC(): Date {
  const 现在 = new Date();
  // toLocaleString + sv-SE 拿到形如 "2026-09-24 15:00:00" 的北京时间字符串
  const 北京字符串 = 现在.toLocaleString("sv-SE", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [日期] = 北京字符串.split(" ");
  return new Date(`${日期}T00:00:00+08:00`);
}

// 拿到"明天 0 点（北京时间）"对应的 UTC Date 对象（前端显示"距离重置还有多久"）
export function 明日零点UTC(): Date {
  return new Date(今日零点UTC().getTime() + 24 * 60 * 60 * 1000);
}

// 查询某个用户今日已生成次数（按 Generation 表的 createdAt 统计）
export async function 今日生成次数(userId: string): Promise<number> {
  return prisma.generation.count({
    where: {
      userId,
      createdAt: { gte: 今日零点UTC() },
    },
  });
}

// 查询某个用户今日还剩几次（自动按他的 plan 算上限）
export async function 剩余次数(userId: string): Promise<number> {
  const [用户, 用了] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    今日生成次数(userId),
  ]);
  return Math.max(0, 额度上限(用户?.plan) - 用了);
}

// 是否已超额（用于 API 路由拦截）
export async function 是否超额(userId: string): Promise<boolean> {
  const 剩余 = await 剩余次数(userId);
  return 剩余 <= 0;
}

// 完整额度信息（前端展示用，用户 plan + 次数一次查完）
export async function 查额度(userId: string): Promise<{
  plan: string;
  已用: number;
  剩余: number;
  总数: number;
  超额: boolean;
  下次重置: Date;
}> {
  const [用户, 已用] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    今日生成次数(userId),
  ]);
  const 上限 = 额度上限(用户?.plan);
  return {
    plan: 用户?.plan ?? "FREE",
    已用,
    剩余: Math.max(0, 上限 - 已用),
    总数: 上限,
    超额: 已用 >= 上限,
    下次重置: 明日零点UTC(),
  };
}
