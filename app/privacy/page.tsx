// 隐私政策页（静态合规页，Creem 审核要求）

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "隐私政策 — CopyBoss",
  description: "CopyBoss 隐私政策：我们如何收集、使用和保护你的数据。",
};

const 段落 = "text-zinc-600 dark:text-zinc-400 leading-7";
const 标题 = "text-xl font-semibold text-black dark:text-zinc-50 mt-10";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          隐私政策
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          生效日期：2026 年 9 月 25 日 · 最近更新：2026 年 9 月 25 日
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          （English summary: CopyBoss collects only the account email and the
          content you submit for generation. We never sell your data. Payments
          are processed by Creem; we do not store card information. You may
          request account deletion anytime by emailing 271811038@qq.com.）
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className={标题}>1. 我们是谁</h2>
          <p className={段落}>
            CopyBoss（以下简称「本服务」）是一款 AI 文案生成工具，运营方为个人开发者
            Peng（联系方式：271811038@qq.com）。本政策说明我们在你使用本服务时如何收集、使用、存储和保护你的信息。
          </p>

          <h2 className={标题}>2. 我们收集哪些信息</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>
              <strong>账户信息</strong>
              ：注册时提供的电子邮箱地址和昵称。
            </li>
            <li>
              <strong>使用内容</strong>
              ：你在生成文案时输入的主题、关键词，以及系统生成并保存到你历史记录的文案。
            </li>
            <li>
              <strong>使用数据</strong>
              ：调用次数、访问时间等技术日志，用于额度控制与服务稳定性保障。
            </li>
            <li>
              <strong>支付信息</strong>
              ：升级 Pro 会员的付款由第三方支付服务商 Creem
              处理。<strong>我们全程不接触、不存储你的银行卡号、有效期等支付敏感信息。</strong>
            </li>
          </ul>

          <h2 className={标题}>3. 我们如何使用这些信息</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>生成并返回你请求的文案内容；</li>
            <li>维持账户登录状态与历史记录功能；</li>
            <li>统计每日使用次数以执行免费版 / Pro 版的额度限制；</li>
            <li>在出现支付、账户等技术问题时与你联系；</li>
            <li>保障服务安全，防止滥用与恶意攻击。</li>
          </ul>

          <h2 className={标题}>4. 第三方服务</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>
              <strong>AI 生成服务（DeepSeek）</strong>
              ：你输入的主题与关键词会发送给 AI 模型服务商以完成文案生成；
            </li>
            <li>
              <strong>支付服务商（Creem）</strong>
              ：处理订阅付款与退款，其自身隐私政策适用于支付环节；
            </li>
            <li>
              <strong>基础设施（Vercel / Neon）</strong>
              ：提供网站托管与数据库存储。
            </li>
          </ul>
          <p className={段落}>
            我们不会出售、出租你的个人信息，也不会将其用于与提供本服务无关的目的。
          </p>

          <h2 className={标题}>5. 数据存储与保留</h2>
          <p className={段落}>
            你的数据存储于受保护的云数据库中。账户注销或你主动请求删除后，我们将在
            30 天内删除你的账户信息与历史文案，法律法规要求保留的记录除外。
          </p>

          <h2 className={标题}>6. 数据安全</h2>
          <p className={段落}>
            我们采用加密传输（HTTPS）、访问控制与最小化收集原则保护你的数据。任何数据泄露事件将在确认后及时通知受影响用户。
          </p>

          <h2 className={标题}>7. 你的权利</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>随时查看、更正你的账户信息；</li>
            <li>删除自己的历史文案；</li>
            <li>注销账户并要求彻底删除全部个人数据（发邮件至 271811038@qq.com）；</li>
            <li>随时取消 Pro 订阅，取消后当期服务持续到期末。</li>
          </ul>

          <h2 className={标题}>8. Cookie</h2>
          <p className={段落}>
            本服务仅使用维持登录所必需的 Cookie（会话凭证），不使用广告追踪
            Cookie。
          </p>

          <h2 className={标题}>9. 政策更新</h2>
          <p className={段落}>
            政策如有重大变更，我们会通过网站公告或邮件通知你。继续使用本服务即视为接受更新后的政策。
          </p>

          <h2 className={标题}>10. 联系我们</h2>
          <p className={段落}>
            对本政策或你的数据有任何问题，请联系：
            <a
              className="text-black dark:text-zinc-50 underline"
              href="mailto:271811038@qq.com"
            >
              271811038@qq.com
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
