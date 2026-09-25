// 可接受使用政策页（静态合规页，Creem 审核要求第 4 条）
// 说明本 AI 工具允许和禁止的用途

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "可接受使用政策 — CopyBoss",
  description: "CopyBoss 使用规则：允许的用途与禁止的用途。",
};

const 段落 = "text-zinc-600 dark:text-zinc-400 leading-7";
const 标题 = "text-xl font-semibold text-black dark:text-zinc-50 mt-10";

export default function AcceptableUsePage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          可接受使用政策
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          生效日期：2026 年 9 月 25 日 · 最近更新：2026 年 9 月 25 日
        </p>
        <p className="mt-6 text-sm text-zinc-500 dark:text-zinc-400">
          （English summary: CopyBoss may only be used for lawful marketing
          copy creation. Prohibited: illegal content, harassment / hate
          speech, deception &amp; scams, spam, infringement of others&apos;
          rights, attempts to abuse or reverse the service. Violations lead to
          suspension. Report abuse to 271811038@qq.com.）
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className={标题}>1. 本工具的定位</h2>
          <p className={段落}>
            CopyBoss 是一款<strong>面向合法营销场景的 AI 文案生成工具</strong>
            ：帮助商家、博主与创作者更高效地撰写小红书、微信公众号、抖音等平台的产品介绍、种草笔记与推广文案。
          </p>

          <h2 className={标题}>2. 允许的用途</h2>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>为自己经营的品牌、店铺、账号撰写推广文案；</li>
            <li>为客户（须有合法授权）代写营销内容；</li>
            <li>改写、优化自己已有的文案表达。</li>
          </ul>

          <h2 className={标题}>3. 禁止的用途</h2>
          <p className={段落}>使用本服务生成、传播以下内容，或将其用于以下目的，均属违规：</p>
          <ul className={`${段落} list-disc pl-6 flex flex-col gap-2`}>
            <li>
              <strong>违法内容</strong>
              ：违反运营方所在地及内容发布地法律法规的任何内容，包括但不限于危害国家安全、淫秽色情、赌博、毒品、暴力恐怖相关内容；
            </li>
            <li>
              <strong>欺诈与误导</strong>
              ：虚假广告、诈骗话术、假冒品牌或机构、伪造资质与数据；
            </li>
            <li>
              <strong>侵权内容</strong>
              ：侵犯他人著作权、商标权、名誉权、隐私权的内容；
            </li>
            <li>
              <strong>仇恨与骚扰</strong>
              ：针对个人或群体的歧视、侮辱、恐吓、人肉搜索相关内容；
            </li>
            <li>
              <strong>垃圾营销</strong>
              ：批量生成用于群发、刷量、刷评的重复性垃圾内容；
            </li>
            <li>
              <strong>未成年保护</strong>
              ：任何涉及危害未成年人身心健康的用途；
            </li>
            <li>
              <strong>技术滥用</strong>
              ：爬虫抓取、逆向工程、绕过额度限制、攻击或干扰本服务及其基础设施。
            </li>
          </ul>

          <h2 className={标题}>4. 违规处理</h2>
          <p className={段落}>
            对违规账户，我们有权视情节采取限制额度、暂停服务、终止账户等措施；涉嫌违法的，将配合执法部门依法处理。
          </p>

          <h2 className={标题}>5. 举报与联系</h2>
          <p className={段落}>
            如发现有人利用本服务从事上述禁止行为，请举报至{" "}
            <a
              className="text-black dark:text-zinc-50 underline"
              href="mailto:271811038@qq.com"
            >
              271811038@qq.com
            </a>
            ，我们将在 3 个工作日内核实处理。
          </p>

          <p className={`${段落} mt-6`}>
            本政策是{" "}
            <Link href="/terms" className="underline text-black dark:text-zinc-50">
              服务条款
            </Link>{" "}
            的一部分，使用本服务即表示你已阅读并同意遵守。
          </p>
        </div>
      </main>
    </div>
  );
}
