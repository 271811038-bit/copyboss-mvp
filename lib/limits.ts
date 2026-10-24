// 用户额度管理
// 业务规则（2026-10-25 国际版调整）：
//   FREE 免费版：每天 1 次生成（UTC 0 点重置）
//   PRO 会员：  每天 10 次生成
//   加油包：    PRO 当日额度用尽后，可买加油包（$1 / 10 次），
//               购买后立即到账 User.extraCredits，当日额度用尽时自动消耗，
//               不随 0 点重置（用完为止）
// 收藏、删除、复制、查看历史 —— 都不计次数
//
// 设计决策：
// 1. 用独立的 Generation 表（不与 Copy 表耦合）
//    1 次请求可能产出 5/10/30 条文案，但只算 1 次额度（符合"按一次=一次"的直觉）
// 2. 时区用 UTC（国际化版本，全球用户统一以 UTC 0 点为日界线）
// 3. 额度上限跟着用户的 plan 走（webhook 付费成功 → plan=PRO → 自动涨额度）
// 4. 扣费顺序：先扣当日额度，超出部分扣加油包（Generation 表只记次数，
//    加油包次数在生成成功后由 扣加油包若超额() 原子扣减）

import { prisma } from "./db";

// 各档位的每日次数（改价/改额度只动这里）
export const 每日次数表: Record<string, number> = {
  FREE: 1,
  PRO: 10,
};

// 免费版每日次数（保留这个导出，历史代码还在用）
export const 每日免费次数 = 每日次数表.FREE;

// Pro 版每日次数
export const 每日Pro次数 = 每日次数表.PRO;

// 未知 plan 一律按免费处理（安全默认：宁可少给，不可多给）
export function 额度上限(plan: string | null | undefined): number {
  return 每日次数表[plan ?? "FREE"] ?? 每日次数表.FREE;
}

// 拿到"今天 0 点（UTC）"对应的 Date 对象
// 例：现在是 2026-09-24 15:00 UTC → 返回 2026-09-24 00:00 UTC
export function 今日零点UTC(): Date {
  const 现在 = new Date();
  const utc字符串 = 现在.toISOString().slice(0, 10); // "2026-09-24"
  return new Date(`${utc字符串}T00:00:00Z`);
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

// 生成成功后的扣费：当日额度已用尽时，扣 1 次加油包（原子操作，余额不足不动）
export async function 扣加油包若超额(userId: string): Promise<void> {
  const [用户, 已用] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true } }),
    今日生成次数(userId),
  ]);
  if (!用户) return;
  if (已用 >= 额度上限(用户.plan)) {
    await prisma.user.updateMany({
      where: { id: userId, extraCredits: { gt: 0 } },
      data: { extraCredits: { decrement: 1 } },
    });
  }
}

// 查询某个用户今日还剩几次（当日额度 + 加油包余额）
export async function 剩余次数(userId: string): Promise<number> {
  const [用户, 用了] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, extraCredits: true } }),
    今日生成次数(userId),
  ]);
  const 当日剩余 = Math.max(0, 额度上限(用户?.plan) - 用了);
  return 当日剩余 + (用户?.extraCredits ?? 0);
}

// 是否已超额（用于 API 路由拦截）：当日额度用尽 且 加油包也没有
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
  加油包剩余: number;
  下次重置: Date;
}> {
  const [用户, 已用] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { plan: true, extraCredits: true } }),
    今日生成次数(userId),
  ]);
  const 上限 = 额度上限(用户?.plan);
  const 加油包剩余 = 用户?.extraCredits ?? 0;
  return {
    plan: 用户?.plan ?? "FREE",
    已用,
    剩余: Math.max(0, 上限 - 已用) + 加油包剩余,
    总数: 上限,
    超额: 已用 >= 上限 && 加油包剩余 <= 0,
    加油包剩余,
    下次重置: 明日零点UTC(),
  };
}
