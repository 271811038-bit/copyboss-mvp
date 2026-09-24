// 这是服务端组件（没有 "use client"）
// 职责：
// 1. 确认用户已登录（proxy.ts 已经挡住了未登录，但二次确认更稳）
// 2. 查今日额度（一次数据库查询，比客户端再发请求快）
// 3. 把额度信息打包成 props 传给客户端表单组件
//
// 为什么不让客户端直接查：避免 waterfall（页面加载后再 fetch 额度 → 再渲染）

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { 查额度 } from "@/lib/limits";
import GenerateForm from "./GenerateForm";

export default async function GeneratePage() {
  const 会话 = await auth();
  if (!会话?.user?.id) {
    redirect("/login?callbackUrl=/generate");
  }

  const 额度 = await 查额度(会话.user.id);

  // Date 不能直接通过 server→client 边界，转 ISO 字符串
  const 初始额度 = {
    plan: 额度.plan,
    已用: 额度.已用,
    剩余: 额度.剩余,
    总数: 额度.总数,
    超额: 额度.超额,
    下次重置: 额度.下次重置.toISOString(),
  };

  return <GenerateForm 初始额度={初始额度} />;
}
