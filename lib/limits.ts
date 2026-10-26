// 用户额度管理
// 业务规则（2026-10-26 按组合计费版）：
//
//   计价单位：「1 credit = 1 个平台 × 1 个风格」（产出 3 条文案）
//   FREE       ：每天 1 credit
//   PRO        ：每天 10 credits
//   PRO_YEARLY ：每天 20 credits
//   加油包     ：当日额度用尽后可买（$1 / 10 credits，包年用户 $1 / 20 credits），
//                购买即写入 User.extraCredits，不随每日重置，用完为止
//
// 为什么这么改（2026-10-26 决策）：
//   旧规则「点一次 = 1 次额度」，而一次点击可以勾 4 平台 × 4 风格 = 16 个组合、
//   产出 56+ 条文案。结果：① 同一次额度价值相差 16 倍，计价不透明；
//   ② 免费用户点一次就拿到一周的产量，没有升级动机；
//   ③ 一次点击串行跑 16 次 AI，等待过久、失败概率高。
//   改为按组合计费后：价值稳定（1 credit 恒等于 3 条）、免费档自然收紧、
//   前端可以实时显示"本次将消耗 N credits"。
//
// 收藏、删除、复制、查看历史 —— 都不计额度

import { prisma } from "./db";

// 各档位每日 credits（改价/改额度只动这里）
export const 每日额度表: Record<string, number> = {
  FREE: 1,
  PRO: 10,
  PRO_YEARLY: 20,
};

// 兼容旧命名（历史代码/脚本还在引用）
export const 每日次数表 = 每日额度表;
export const 每日免费次数 = 每日额度表.FREE;
export const 每日Pro次数 = 每日额度表.PRO;

// 1 credit 产出几条文案（与 actions.ts / api/generate 保持一致）
export const 每额度条数 = 3;

// 未知 plan 一律按免费处理（安全默认：宁可少给，不可多给）
export function 额度上限(plan: string | null | undefined): number {
  return 每日额度表[plan ?? "FREE"] ?? 每日额度表.FREE;
}

// 拿到"今天 0 点（UTC）"对应的 Date 对象
export function 今日零点UTC(): Date {
  const 现在 = new Date();
  const utc字符串 = 现在.toISOString().slice(0, 10); // "2026-09-24"
  return new Date(`${utc字符串}T00:00:00Z`);
}

// 明天的 0 点（前端显示"距离重置还有多久"）
export function 明日零点UTC(): Date {
  return new Date(今日零点UTC().getTime() + 24 * 60 * 60 * 1000);
}

// 今日已用 credits（按 Generation.creditCount 求和）
// 注意：creditCount 是 2026-10-26 新增字段，历史行为默认值 1（兼容）
export async function 今日已用额度(userId: string): Promise<number> {
  const 汇总 = await prisma.generation.aggregate({
    where: {
      userId,
      createdAt: { gte: 今日零点UTC() },
    },
    _sum: { creditCount: true },
  });
  return 汇总._sum.creditCount ?? 0;
}

// 兼容旧函数名
export const 今日生成次数 = 今日已用额度;

// 生成后的加油包结算
// 只扣「本次运行新增的超出部分」，避免重复扣：
//   超出前 = max(0, 已用前 - 上限)，超出后 = max(0, 已用后 - 上限)，扣 (超出后 - 超出前)
export async function 结算加油包(
  userId: string,
  已用前: number,
  已用后: number
): Promise<number> {
  const 用户 = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!用户) return 0;

  const 上限 = 额度上限(用户.plan);
  const 超出前 = Math.max(0, 已用前 - 上限);
  const 超出后 = Math.max(0, 已用后 - 上限);
  const 应扣 = 超出后 - 超出前;

  if (应扣 <= 0) return 0;

  // 余额不足时不动（前面已做额度闸，这里是最后一道保险）
  const 结果 = await prisma.user.updateMany({
    where: { id: userId, extraCredits: { gte: 应扣 } },
    data: { extraCredits: { decrement: 应扣 } },
  });
  return 结果.count > 0 ? 应扣 : 0;
}

// 兼容旧函数名（旧逻辑只扣 1 次，新逻辑由 结算加油包 承担）
export async function 扣加油包若超额(userId: string): Promise<void> {
  const 用户 = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  if (!用户) return;
  const 已用 = await 今日已用额度(userId);
  await 结算加油包(userId, Math.max(0, 已用 - 1), 已用);
}

// 查询今日还剩多少 credits（当日额度 + 加油包余额）
export async function 剩余次数(userId: string): Promise<number> {
  const [用户, 用了] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, extraCredits: true },
    }),
    今日已用额度(userId),
  ]);
  const 当日剩余 = Math.max(0, 额度上限(用户?.plan) - 用了);
  return 当日剩余 + (用户?.extraCredits ?? 0);
}

// 是否已超额（当日额度用尽 且 加油包也没有）
export async function 是否超额(userId: string): Promise<boolean> {
  return (await 剩余次数(userId)) <= 0;
}

// 完整额度信息（前端展示用）
export async function 查额度(userId: string): Promise<{
  plan: string;
  已用: number;
  剩余: number;
  总数: number;
  超额: boolean;
  加油包剩余: number;
  当日剩余: number;
  下次重置: Date;
}> {
  const [用户, 已用] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, extraCredits: true },
    }),
    今日已用额度(userId),
  ]);
  const 上限 = 额度上限(用户?.plan);
  const 加油包剩余 = 用户?.extraCredits ?? 0;
  const 当日剩余 = Math.max(0, 上限 - 已用);
  return {
    plan: 用户?.plan ?? "FREE",
    已用,
    剩余: 当日剩余 + 加油包剩余,
    总数: 上限,
    超额: 已用 >= 上限 && 加油包剩余 <= 0,
    加油包剩余,
    当日剩余,
    下次重置: 明日零点UTC(),
  };
}
