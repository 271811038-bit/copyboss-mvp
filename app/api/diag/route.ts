// 错误上报收集接口：前端 JS 错误落进 Vercel 日志，便于远程诊断兼容性问题
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    // 结构化输出，vercel logs 里 grep "Diag" 即可找到
    console.error(
      `[Diag] ${data.type} | ${data.message} | ${data.detail} | ${data.url} | ${data.ua}`
    );
  } catch {
    // 解析失败也忽略——诊断接口不能反过来制造错误
  }
  return new NextResponse(null, { status: 204 });
}
