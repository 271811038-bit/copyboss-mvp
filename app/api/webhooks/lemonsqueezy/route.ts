// ============================================================
// POST /api/webhooks/lemonsqueezy —— 支付回调"到账确认员"
//
// 工作流程（整个付费系统的最后一公里）：
// 1. 用户在 Lemon Squeezy 收银台付款
// 2. LS 服务器立刻朝这个地址 POST 一个事件（含订阅信息）
// 3. 我们验签（防伪造：别人瞎发一个"我付款了"不能信）
// 4. 按 meta.custom_data.userId 认出"是我们哪个用户付的钱"
// 5. 把他的 plan 改成 PRO —— 额度自动从 5/天 涨到 30/天
//
// 安全要点：
// - HMAC-SHA256 验签是唯一信任来源，绝不相信请求体本身
// - 验签失败返回 401（LS 会重试，但伪造者拿不到任何信息）
// - userId 也可能是伪造请求体的一部分，但签名过不了就进不来
// ============================================================

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

// 验签：用共享密钥重算一遍签名，和 LS 发来的对得上才是真消息
function 验签(原始请求体: string, 签名头: string | null): boolean {
  const 密钥 = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!密钥 || !签名头) return false;

  const 期望签名 = createHmac("sha256", 密钥).update(原始请求体).digest("hex");
  const 拿到的 = 签名头.startsWith("sha256=") ? 签名头.slice(7) : 签名头;

  // 长度不等直接 false；timingSafeEqual 防时序攻击（逐字节比对耗时恒定）
  if (期望签名.length !== 拿到的.length) return false;
  try {
    return timingSafeEqual(Buffer.from(期望签名), Buffer.from(拿到的));
  } catch {
    return false;
  }
}

// 订阅状态 → 用户套餐 的映射（单一判断点，以后加年费/团队版在这里扩展）
function 状态转套餐(ls状态: string): "PRO" | "FREE" {
  switch (ls状态) {
    case "active":
    case "on_trial":
      return "PRO";
    // cancelled 当期仍有效，但简单起见先降级（MVP 策略：宁可少给不可多给）
    case "cancelled":
    case "expired":
    case "unpaid":
    case "past_due":
    case "paused":
    default:
      return "FREE";
  }
}

export async function POST(请求: Request) {
  // ① 拿原始请求体（验签必须用未解析的原文，JSON.stringify 顺序会变）
  const 原文 = await 请求.text();
  const 签名 = 请求.headers.get("x-signature");

  // ② 验签失败 = 伪造请求，直接拒绝
  if (!验签(原文, 签名)) {
    return NextResponse.json({ error: "签名校验失败" }, { status: 401 });
  }

  // ③ 解析事件
  let 事件: any;
  try {
    事件 = JSON.parse(原文);
  } catch {
    return NextResponse.json({ error: "请求体不是合法 JSON" }, { status: 400 });
  }

  const 事件名: string = 事件?.meta?.event_name ?? "";
  const 数据 = 事件?.data ?? {};
  const 属性 = 数据?.attributes ?? {};
  const 订阅ID: string | undefined = 数据?.id ?? 属性?.id;
  const 订阅状态: string = 属性?.status ?? "";
  const 用户邮箱: string | undefined = 属性?.user_email;
  const lsCustomerID: string | undefined = String(属性?.customer_id ?? "") || undefined;

  // 我们下单时塞的 checkout[custom][userId]，LS 会原样放在 meta.custom_data
  const 自定义 = 事件?.meta?.custom_data ?? {};
  const 我们的用户ID: string | undefined = 自定义.userId;

  // ④ 只处理订阅相关事件（订单/退款等其他事件先不碰）
  const 订阅事件 = [
    "subscription_created",
    "subscription_updated",
    "subscription_cancelled",
    "subscription_expired",
    "subscription_paused",
    "subscription_payment_failed",
    "subscription_payment_success",
    "subscription_payment_recovered",
  ];
  if (!订阅事件.includes(事件名) || !订阅ID) {
    // 不是我们管的事，礼貌返回 200（LS 看到非 200 会无限重试）
    return NextResponse.json({ ok: true, 忽略: 事件名 });
  }

  // ⑤ 认人：优先用下单时带的 userId，兜底用邮箱找
  let 目标用户 = null;
  if (我们的用户ID) {
    目标用户 = await prisma.user.findUnique({ where: { id: 我们的用户ID } });
  }
  if (!目标用户 && 用户邮箱) {
    目标用户 = await prisma.user.findUnique({ where: { email: 用户邮箱 } });
  }

  if (!目标用户) {
    // 找不到人：返回 200 防止 LS 无限重试，但记录不下（MVP 阶段靠日志排查）
    console.error("[LS webhook] 找不到对应用户", { 事件名, 用户邮箱, 我们的用户ID });
    return NextResponse.json({ ok: false, 原因: "用户不存在" }, { status: 200 });
  }

  // ⑥ 更新用户的订阅状态
  const 新套餐 = 状态转套餐(订阅状态);
  await prisma.user.update({
    where: { id: 目标用户.id },
    data: {
      plan: 新套餐,
      lsCustomerId: lsCustomerID ?? 目标用户.lsCustomerId,
      lsSubscriptionId: 订阅ID,
      lsSubscriptionStatus: 订阅状态,
    },
  });

  console.log(
    `[LS webhook] ${事件名} → 用户 ${目标用户.email} 变为 ${新套餐}（订阅状态: ${订阅状态}）`
  );

  // ⑦ 200 告诉 LS"收到了"（不返回 200 LS 会隔一会儿重发，直到把我们服务器烦死）
  return NextResponse.json({ ok: true });
}
