// NextAuth 的 API 端点
// 这一行把 NextAuth 的所有内置路由（/api/auth/signin, /api/auth/signout 等）挂到 Next.js 上
// 我们不用管里面的逻辑——NextAuth 自己处理

import { handlers } from "@/auth";

export const { GET, POST } = handlers;