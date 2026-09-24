# CopyBoss 部署指南

5 步把本地项目部署到 Vercel 拿真域名，全流程约 30 分钟。

---

## 第 1 步：注册 GitHub（5 分钟）

1. 打开 https://github.com/signup
2. 填用户名（建议：`pengzhuruipeng` 或类似）、邮箱、密码
3. 验证邮箱
4. 选免费 plan

---

## 第 2 步：创建 GitHub 仓库（2 分钟）

1. 登录 GitHub 后访问 https://github.com/new
2. Repository name 填：`copyboss`
3. 选 **Private**（私有仓库，你自己的代码不公开）
4. **不要**勾选 "Add a README file"
5. 点 "Create repository"
6. 记下仓库 URL，类似：`https://github.com/你的用户名/copyboss.git`

---

## 第 3 步：注册 Vercel + 关联 GitHub（5 分钟）

1. 打开 https://vercel.com/signup
2. 点 "Continue with GitHub"（一键登录 GitHub 账号）
3. 授权 Vercel 访问你的 GitHub（按提示点确认）
4. 选 Free 计划（个人项目免费）

---

## 第 4 步：把本地代码推送到 GitHub（5 分钟）

把下面这段**贴到终端**（一行一行跑）：

```bash
# 进入项目目录
cd /Users/zhuruipeng/WorkBuddy/2026-09-10-22-00-49/copyboss

# 把你的 GitHub 仓库加为远程地址（替换下面 URL 里的"你的用户名"）
git remote add origin https://github.com/你的用户名/copyboss.git

# 推送所有代码
git branch -M main
git push -u origin main
```

如果 GitHub 让你输入用户名密码：
- 用户名：你的 GitHub 用户名
- 密码：**不是 GitHub 登录密码**，而是 Personal Access Token
- 不知道怎么生成 PAT？看下面"踩坑提示"

### 踩坑提示：Personal Access Token

1. GitHub 头像 → Settings → Developer settings (左下) → Personal access tokens → Tokens (classic)
2. Generate new token
3. Note 填 `copyboss-deploy`
4. Expiration 选 90 days 或 No expiration
5. Scopes 勾选 `repo`（全部子项）
6. 点 Generate token
7. **复制 token 字符串**（只显示一次！）
8. 推送时密码贴这个 token

---

## 第 5 步：Vercel 导入项目（10 分钟）

### 5.1 创建项目

1. 登录 Vercel 后访问 https://vercel.com/new
2. 在 "Import Git Repository" 里找到 `copyboss`
3. 点 "Import"

### 5.2 配置项目

| 配置项 | 值 |
|--------|-----|
| Project Name | `copyboss` |
| Framework Preset | Next.js（自动识别） |
| Root Directory | `./`（默认） |
| Build Command | `prisma migrate deploy && prisma generate && next build` |
| Output Directory | `.next`（默认） |

### 5.3 添加环境变量（重要！）

点 "Environment Variables"，逐个添加：

| Key | Value |
|-----|-------|
| `DATABASE_URL` | （先空着，下一步创建 Postgres 后填） |
| `AUTH_SECRET` | 终端跑 `openssl rand -base64 32` 生成 |
| `NEXTAUTH_URL` | `https://copyboss-你的名字.vercel.app`（先填这个，后面改） |
| `AUTH_TRUST_HOST` | `true` |
| `DEEPSEEK_API_KEY` | `sk-25bbe0a70f4742aa96c0242dd9e4b40a` |
| `NEXTAUTH_SECRET` | 同 `AUTH_SECRET`（复制一份） |

### 5.4 创建 Vercel Postgres 数据库

1. 在 Vercel 项目页面，点 "Storage" 标签
2. 点 "Create Database" → 选 "Postgres"
3. Region 选 "Washington, D.C. (iad1)" 或离你最近的
4. Name 填 `copyboss-db`
5. 点 "Create"
6. 创建完成后回到 Environment Variables 页面
7. `DATABASE_URL` 已经有了，Vercel 自动注入

### 5.5 部署

1. 点 "Deploy"
2. 等 1-3 分钟（看日志）
3. 看到 "🎉 Deployment successful" 就成功了
4. 点 "Visit" 打开你的网站

---

## 第 6 步：首次访问 + 创建账号（2 分钟）

1. 打开你的 Vercel 域名（如 `https://copyboss-xxx.vercel.app`）
2. 点 "立即注册"
3. 邮箱随便填一个你能记住的（生产环境也可以用 peng@copyboss.test）
4. 登录后就能用了

---

## 🎉 完成！

你拿到了：
- ✅ 真域名（Vercel 子域名）
- ✅ 生产级 PostgreSQL 数据库
- ✅ 全栈 SaaS 上线
- ✅ 自动 HTTPS
- ✅ 全球 CDN 加速

### 后续可选
- **绑定自定义域名**：Vercel Settings → Domains → 添加（如 `copyboss.com`）
- **去掉 Vercel 水印**：免费版会自动加，升级 Pro 计划去掉
- **加监控**：Vercel Analytics（免费）

### 排错
- 部署失败 → 看 Vercel 的 Build Logs（最常见：环境变量没填对）
- 登录失败 → 检查 `AUTH_SECRET` / `NEXTAUTH_SECRET` 是否都填了
- 数据库连不上 → 检查 `DATABASE_URL` 是否注入
