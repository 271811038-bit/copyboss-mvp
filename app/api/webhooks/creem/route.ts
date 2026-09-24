// ============================================================
// POST /api/webhooks/creem —— 支付回调"到账确认员"（Creem 版）
//
// 工作流程（整个付费系统的最后一公里）：
// 1. 用户在 Creem 收银台付款
// 2. Creem 服务器立刻朝这个地址 POST 一个事件（含订阅信息）
// 3. 我们验签（防伪造：别人瞎发一个"我付款了"不能信）
// 4. 按 metadata.userId 认出"是我们哪个用户付的钱"
// 5. 把他的 plan 改成 PRO —— 额度自动从 5/天 涨到 30/天
//
// Creem 验签要点（和 LS 的区别）：
// - header 名是 creem-signature，值是纯 hex（没有 "sha256=" 前缀）
// - payload 结构：{ id: "evt_xxx", eventType: "subscription.paid", object: {...} }
// - object.metadata 是我们下单时塞的元数据（含 userId）
//
// 安全要点：
// - HMAC-SHA256 验签是唯一信任来源，绝不相信请求体本身
// - 验签失败返回 401（Creem 会重试 5 次，伪造者拿不到任何信息）
// - 幂等性：同一事件可能投递多次，update 天然幂等，随便重发
// ============================================================

import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

// 验签：用共享密钥重算一遍签名，和 Creem 发来的对得上才是真消息
function 验签(原始请求体: string, 签名头: string | null): boolean {
  const 密钥 = process.env.CREEM_WEBHOOK_SECRET;
  if (!密钥 || !签名头) return false;

  // Creem 的签名就是纯 hex 字符串，无前缀
  const 期望签名 = createHmac("sha256", 密钥).update(原始请求体).digest("hex");

  // 长度不等直接 false；timingSafeEqual 防时序攻击（逐字节比对耗时恒定）
  if (期望签名.length !== 签名头.length) return false;
  try {
    return timingSafeEqual(Buffer.from(期望签名), Buffer.from(签名头));
  } catch {
    return false;
  }
}

// 事件 → 套餐 的映射（单一判断点，以后加年费/团队版在这里扩展）
//
// Creem 语义（比 LS 细）：
// - subscription.paid       扣款成功 → 开权限（官方推荐用这个开权限）
// - subscription.active     新订阅创建 → 也算（首次付款示例数据）
// - subscription.trialing   试用期 → 先给权限（试用期结束自然收到 expired）
// - subscription.scheduled_cancel 只是"预约取消"，当期仍有效 → 保持 PRO
// - subscription.canceled   真取消了 → FREE（MVP 简化，宁可少给不可多给）
// - refund.created          退款 → FREE
function 事件转套餐(事件名: string): "PRO" | "FREE" | null {
  switch (事件名) {
    case "checkout.completed": // 一次性购买/订阅首单完成 → PRO
    case "subscription.active":
    case "subscription.paid":
    case "subscription.trialing":
    case "subscription.scheduled_cancel": // 当期还有效
      return "PRO";
    case "subscription.canceled":
    case "subscription.expired":
    case "subscription.paused":
    case "subscription.unpaid":
    case "subscription.past_due":
    case "refund.created":
      return "FREE";
    default:
      return null; // 不相关的事件，忽略
  }
}

export async function POST(请求: Request) {
  // ① 拿原始请求体（验签必须用未解析的原文，JSON.stringify 顺序会变）
  const 原文 = await 请求.text();
  const 签名 = 请求.headers.get("creem-signature");

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

  const 事件名: string = 事件?.eventType ?? "";
  const 对象 = 事件?.object ?? {};

  // ④ 判断这个事件该把用户设成什么套餐（null = 不关我们事）
  const 新套餐 = 事件转套餐(事件名);
  if (新套餐 === null) {
    // 礼貌返回 200（非 200 Creem 会重试 5 次，别烦它）
    return NextResponse.json({ ok: true, 忽略: 事件名 });
  }

  // ⑤ 认人：优先用下单时塞的 metadata.userId，兜底用邮箱找
  // checkout.completed 的订阅在 object.subscription；订阅事件主体就是 object
  const 订阅对象 = 对象?.object === "checkout" ? 对象?.subscription ?? {} : 对象;
  const 元数据 = 订阅对象?.metadata ?? 对象?.metadata ?? {};
  const 我们的用户ID: string | undefined = 元数据?.userId;
  const 用户邮箱: string | undefined = 对象?.customer?.email;

  const 订阅ID: string | undefined = 订阅对象?.id ?? undefined;
  const 客户ID: string | undefined = 对象?.customer?.id ?? undefined;

  let 目标用户 = null;
  if (我们的用户ID) {
    目标用户 = await prisma.user.findUnique({ where: { id: 我们的用户ID } });
  }
  if (!目标用户 && 用户邮箱) {
    目标用户 = await prisma.user.findUnique({ where: { email: 用户邮箱 } });
  }

  if (!目标用户) {
    // 找不到人：返回 200 防止 Creem 无限重试，留日志排查
    console.error("[Creem webhook] 找不到对应用户", { 事件名, 用户邮箱, 我们的用户ID });
    return NextResponse.json({ ok: false, 原因: "用户不存在" }, { status: 200 });
  }

  // ⑥ 更新用户的订阅状态
  // 注：lsXxx 字段沿用（历史命名），现在存的是 Creem 的 cust_/sub_ ID
  await prisma.user.update({
    where: { id: 目标用户.id },
    data: {
      plan: 新套餐,
      lsCustomerId: 客户ID ?? 目标用户.lsCustomerId,
      ...(订阅ID ? { lsSubscriptionId: 订阅ID } : {}),
      lsSubscriptionStatus: 事件名,
    },
  });

  console.log(
    `[Creem webhook] ${事件名} → 用户 ${目标用户.email} 变为 ${新套餐}`
  );

  // ⑦ 200 告诉 Creem"收到了"
  return NextResponse.json({ ok: true });
}
