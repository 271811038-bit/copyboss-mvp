// NextAuth v5 配置（Auth.js）
// 这是整个 CopyBoss 用户认证的"总闸门"
//
// 学完这一段你应该能讲清楚：
// 1. JWT session 是怎么工作的
// 2. 为什么 authorize 函数要返回 user 或 null
// 3. signIn/signOut/auth/handlers 各自干啥

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

// NextAuth() 函数返回一个对象，里面有 4 个工具：
//   handlers: Next.js 路由处理器（让 /api/auth/* 能用）
//   signIn:    服务端登录（表单提交时用）
//   signOut:   服务端登出
//   auth:      读取当前会话（任何地方都能用：服务端组件、API、middleware）
export const { handlers, signIn, signOut, auth } = NextAuth({
  // 用 JWT session：session 信息加密后存在 cookie 里
  // 服务端不存任何东西——重启服务、迁移服务器都不断线
  session: { strategy: "jwt" },

  // 自定义登录页（默认 NextAuth 有丑丑的内置页）
  pages: {
    signIn: "/login",
  },

  providers: [
    // 邮箱 + 密码登录（最基础、最可控）
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "邮箱", type: "email" },
        password: { label: "密码", type: "password" },
      },

      // 这个函数是 NextAuth 最核心的"鉴权员"
      // 用户登录时，NextAuth 会调它，传过来用户填的邮箱密码
      // 返回 user 对象 = 登录成功；返回 null = 登录失败
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;

        if (!email || !password) return null;

        // 1. 查数据库找这个邮箱的用户
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        // 2. 比对密码（数据库存的是哈希过的"乱码"，要重新哈希比对）
        const 密码正确 = await bcrypt.compare(password, user.hashedPassword);
        if (!密码正确) return null;

        // 3. 返回用户信息（这些字段会被塞进 JWT）
        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      },
    }),
  ],

  // JWT 里的"用户信息长什么样"——这是我们约定的"shape"
  callbacks: {
    async jwt({ token, user }) {
      // 登录时 user 有值，session 续期时 user 是 undefined
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 把 token.id 复制到 session.user.id，让前端能读到
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});