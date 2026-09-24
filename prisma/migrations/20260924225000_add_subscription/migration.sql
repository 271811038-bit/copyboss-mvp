-- 订阅功能：User 表加 Lemon Squeezy 相关字段
-- plan 默认 'FREE'，存量用户自动归为免费版
-- lsSubscriptionId 加唯一索引（webhook 高频按订阅 id 反查用户）

ALTER TABLE "User" ADD COLUMN "plan" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "lsCustomerId" TEXT;
ALTER TABLE "User" ADD COLUMN "lsSubscriptionId" TEXT;
ALTER TABLE "User" ADD COLUMN "lsSubscriptionStatus" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_lsSubscriptionId_key" ON "User"("lsSubscriptionId");
