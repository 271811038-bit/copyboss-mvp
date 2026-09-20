// 注册 API
// POST /api/auth/register
// 接收 { email, password, name? }，创建新用户

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// 强制这个路由不要被静态缓存（永远在服务器跑）
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    // 基础校验
    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码必填" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码至少 6 位" },
        { status: 400 }
      );
    }

    // 检查邮箱已存在
    const 已存在 = await prisma.user.findUnique({ where: { email } });
    if (已存在) {
      return NextResponse.json(
        { error: "这个邮箱已经注册过了，直接登录吧" },
        { status: 400 }
      );
    }

    // 把密码哈希成"乱码"再存数据库
    // 10 = 加盐轮数，越大越安全但越慢（10 是行业标准）
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await prisma.user.create({
      data: {
        email,
        hashedPassword,
        name: name || null,
      },
      select: { id: true, email: true, name: true },  // 不返回 hashedPassword
    });

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error("注册失败:", err);
    return NextResponse.json(
      { error: "服务器开小差了，请重试" },
      { status: 500 }
    );
  }
}