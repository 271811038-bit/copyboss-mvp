// 中间件：路由守门员
// 在每个请求到达页面之前先跑这里——未登录就跳到登录页

import { auth } from "@/auth";
import { NextResponse } from "next/server";

// 哪些路径需要登录才能进
const 受保护的路径 = ["/generate", "/history"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const 需要登录 = 受保护的路径.some((路径) => pathname.startsWith(路径));

  if (需要登录 && !req.auth) {
    // 用户没登录 → 跳到登录页，并把原本想去的路径带过去
    const 登录URL = new URL("/login", req.nextUrl.origin);
    登录URL.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(登录URL);
  }

  // 已登录或路径不受保护，放行
  return NextResponse.next();
});

// Next.js 决定哪些请求跑这个中间件
// 我们保护 /generate 和 /history，其他路径不跑
export const config = {
  matcher: ["/generate/:path*", "/history/:path*"],
};