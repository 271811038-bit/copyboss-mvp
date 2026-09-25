// 服务条款页（静态合规页，Creem 审核要求）

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "服务条款 — CopyBoss",
  description: "CopyBoss 服务条款：使用本服务前请阅读。",
};

const 段落 = "text-zinc-600 dark:text-zinc-400 leading-7";
const 标题 = "text-xl font-semibold text-black dark:text-zinc-50 mt-10";

export default function TermsPage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          服务条款
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          生效日期：2026 年 9 月 25 日 · 最近更新：2026 年 9 月 25 日
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          （English summary: CopyBoss provides AI-generated marketing copy.
          Free plan: 5 uses/day; Pro plan: $2.99/month, 30 uses/day, billed
          via Creem, cancel anytime. AI output may contain errors — review
          before publishing. We may suspend accounts that violate our
          Acceptable Use Policy. Questions: 271811038@qq.com.）
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className={标题}>1. 服务说明</h2>
          <p className={段落}>
            CopyBoss
            是一款在线 AI 文案生成工具：你输入主题与要求，系统为你生成适用于小红书、微信公众号、抖音等平台的营销文案。本服务通过
            https://mtboss.cn 提供，运营方为个人开发者 Peng（联系方式：271811038@qq.com）。
          </p>

          <h2 className={标题}>2. 账户</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>注册需提供有效电子邮箱；你须妥善保管账户密码，账户下的所有操作视为你本人操作；</li>
            <li>禁止注册机器账户、批量注册或转让账户；</li>
            <li>违反使用规则的账户可能被暂停或终止（见「可接受使用政策」）。</li>
          </ul>

          <h2 className={标题}>3. 会员计划与收费</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>
              <strong>免费版</strong>：每天 5 次生成额度，无需付费；
            </li>
            <li>
              <strong>Pro 会员</strong>：$2.99 / 月，每天 30
              次生成额度，通过第三方支付服务商 <strong>Creem</strong> 按月自动续费；
            </li>
            <li>可随时取消订阅：取消后当期已付费时段继续有效，到期后不再扣费；</li>
            <li>价格如有调整，将提前通知，不影响已生效的订阅周期；</li>
            <li>付款币种为美元（USD），由 Creem 作为商家记录（Merchant of Record）完成收款。</li>
          </ul>

          <h2 className={标题}>4. AI 生成内容的说明</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>
              AI 生成的文案<strong>可能存在错误、不准确或不恰当的表达</strong>
              ，发布前请务必自行审核；
            </li>
            <li>同一主题多次生成会返回不同结果，这是 AI 生成的正常特性；</li>
            <li>你对自己基于生成内容做出的发布、传播等使用行为负责。</li>
          </ul>

          <h2 className={标题}>5. 内容权利</h2>
          <p className={段落}>
            你输入的内容归你所有；你生成的文案可在合法范围内自由使用（包括商业用途）。我们仅在你使用服务所必需的范围内存储这些内容。
          </p>

          <h2 className={标题}>6. 退款政策</h2>
          <p className={段落}>
            订阅服务按月计费，已开始的订阅周期原则上不予退款。如遇重复扣款、未授权扣款等异常情况，请联系
            271811038@qq.com，我们将在核实后协助处理。
          </p>

          <h2 className={标题}>7. 服务变更与终止</h2>
          <p className={段落}>
            我们可能因技术、合规等原因调整或中止部分功能；重大变更将提前公告。你随时可以停止使用并注销账户。
          </p>

          <h2 className={标题}>8. 免责声明</h2>
          <p className={段落}>
            本服务按「现状」提供。在法律允许的最大范围内，我们不对因使用或无法使用本服务造成的间接损失承担责任。
          </p>

          <h2 className={标题}>9. 其他</h2>
          <p className={段落}>
            本条款受运营方所在地法律管辖。条款与「可接受使用政策」「隐私政策」共同构成完整协议。如有疑问请联系
            271811038@qq.com。
          </p>
        </div>
      </main>
    </div>
  );
}
