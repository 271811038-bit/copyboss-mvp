// 用户额度管理
// 业务规则：每个注册用户每天（北京时间 0 点重置）可以免费生成 5 次
// 收藏、删除、复制、查看历史 —— 都不计次数
//
// 设计决策：
// 1. 用独立的 Generation 表（不与 Copy 表耦合）
//    1 次 POST /api/generate 请求 = 1 条 Generation 记录
//    1 次请求可能产出 5/10/30 条文案，但只算 1 次额度
//    这样符合用户对"按一次 = 一次"的直觉
// 2. 时区用 UTC+8（北京时间），因为目标用户全在中国
//    数据库 createdAt 是 UTC 存的，查询时要减 8 小时

import { prisma } from "./db";

// 单用户每日免费次数（后期可改成按订阅等级走不同额度）
export const 每日免费次数 = 5;

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

// 查询某个用户今日还剩几次
export async function 剩余次数(userId: string): Promise<number> {
  const 用了 = await 今日生成次数(userId);
  return Math.max(0, 每日免费次数 - 用了);
}

// 是否已超额（用于 API 路由拦截）
export async function 是否超额(userId: string): Promise<boolean> {
  const 用了 = await 今日生成次数(userId);
  return 用了 >= 每日免费次数;
}

// 完整额度信息（前端展示用，一次查询全拿走，避免 3 次 round-trip）
export async function 查额度(userId: string): Promise<{
  已用: number;
  剩余: number;
  总数: number;
  超额: boolean;
  下次重置: Date;
}> {
  const 已用 = await 今日生成次数(userId);
  return {
    已用,
    剩余: Math.max(0, 每日免费次数 - 已用),
    总数: 每日免费次数,
    超额: 已用 >= 每日免费次数,
    下次重置: 明日零点UTC(),
  };
}
