// 可接受使用政策页（静态合规页，Creem 审核要求第 4 条）
// 说明本 AI 工具允许和禁止的用途

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Acceptable Use Policy — CopyBoss",
  description: "Rules for using CopyBoss: what you may and may not generate with our AI tool.",
};

const 段落 = "text-zinc-600 dark:text-zinc-400 leading-7";
const 标题 = "text-xl font-semibold text-black dark:text-zinc-50 mt-10";

export default function AcceptableUsePage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Acceptable Use Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Effective date: October 25, 2026 · Last updated: October 25, 2026
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className={标题}>1. Purpose</h2>
          <p className={段落}>
            This policy defines what CopyBoss may and may not be used for. It
            applies to every prompt you submit and every piece of content you
            generate or publish using the service.
          </p>

          <h2 className={标题}>2. You may use CopyBoss for</h2>
          <ul className={`${段落} list-disc pl-6 space-y-1`}>
            <li>Writing marketing copy for your own legitimate products and services.</li>
            <li>Drafting social media content, captions and scripts for accounts you control or are authorized to manage.</li>
            <li>Brainstorming headlines, hooks and calls-to-action.</li>
          </ul>

          <h2 className={标题}>3. You may NOT use CopyBoss to</h2>
          <ul className={`${段落} list-disc pl-6 space-y-1`}>
            <li>Create content that is defamatory, harassing, hateful, discriminatory or threatening.</li>
            <li>Promote illegal products or services, including drugs, weapons, malware or counterfeit goods.</li>
            <li>Generate sexual content involving minors, or any content that sexualizes minors — this is absolutely prohibited and will be reported.</li>
            <li>Create scams, phishing content, fake reviews or misleading financial or health claims.</li>
            <li>Impersonate real people or brands without authorization.</li>
            <li>Spam: mass-generating near-identical posts to flood platforms.</li>
          </ul>

          <h2 className={标题}>4. Quotas and abuse</h2>
          <p className={段落}>
            Each plan has a daily generation quota (resetting at midnight UTC).
            Do not attempt to circumvent quotas through multiple accounts,
            automation or technical exploits. Accounts that abuse the service
            may be suspended without refund.
          </p>

          <h2 className={标题}>5. Enforcement</h2>
          <p className={段落}>
            We may investigate suspected violations and suspend or terminate
            accounts that breach this policy. Where required by law, we will
            report illegal content to the relevant authorities.
          </p>

          <h2 className={标题}>6. Reporting</h2>
          <p className={段落}>
            To report content or usage that violates this policy, email{" "}
            <a href="mailto:271811038@qq.com" className="underline">271811038@qq.com</a>{" "}
            with details. We take every report seriously.
          </p>
        </div>
      </main>
    </div>
  );
}
