// 数据库访问的"总闸门"
// 整个项目只有这一处 import PrismaClient，其他文件都从这里拿
// 原因：避免每次都新建 client 连接（浪费资源 + 内存泄漏）

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 开发时 hot reload 会让这个文件被执行多次
// 用 globalThis 缓存一份 client，避免重连
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// 用法示例：
// import { prisma } from "@/lib/db";
// const users = await prisma.user.findMany();  // 查所有用户
// const user = await prisma.user.create({ data: { email: "x@y.com", hashedPassword: "..." } });  // 加用户