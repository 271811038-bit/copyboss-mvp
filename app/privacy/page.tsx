// 隐私政策页（静态合规页，Creem 审核要求）

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — CopyBoss",
  description: "CopyBoss Privacy Policy: how we collect, use and protect your data.",
};

const 段落 = "text-zinc-600 dark:text-zinc-400 leading-7";
const 标题 = "text-xl font-semibold text-black dark:text-zinc-50 mt-10";

export default function PrivacyPage() {
  return (
    <div className="flex-1 bg-zinc-50 dark:bg-black">
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-black dark:text-zinc-50">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          Effective date: October 25, 2026 · Last updated: October 25, 2026
        </p>

        <div className="mt-10 flex flex-col gap-4">
          <h2 className={标题}>1. Who we are</h2>
          <p className={段落}>
            CopyBoss ("we", "us") operates the website mtboss.cn, an AI-powered
            copywriting tool for social media. Contact us anytime at{" "}
            <a href="mailto:271811038@qq.com" className="underline">271811038@qq.com</a>.
          </p>

          <h2 className={标题}>2. What we collect</h2>
          <p className={段落}>
            We collect only the minimum data needed to run the service:
          </p>
          <ul className={`${段落} list-disc pl-6 space-y-1`}>
            <li><strong>Account data:</strong> your email address and (optionally) a display name.</li>
            <li><strong>Content you submit:</strong> the product descriptions you enter and the copy the AI generates for you.</li>
            <li><strong>Usage data:</strong> generation counts and timestamps, used to enforce daily quotas.</li>
          </ul>

          <h2 className={标题}>3. What we do NOT collect</h2>
          <p className={段落}>
            We never see or store your payment card details. All payments are
            processed by our payment partner Creem. We do not buy, sell or share
            your data with advertisers or data brokers.
          </p>

          <h2 className={标题}>4. How we use your data</h2>
          <p className={段落}>
            Your email identifies your account and delivers service-related
            notices. Your prompts and generated copy are stored so you can view
            them in your history — they are visible only to you. We use
            aggregate usage counts to enforce daily quotas and prevent abuse.
          </p>

          <h2 className={标题}>5. Third-party processors</h2>
          <p className={段落}>
            We rely on a small number of processors: Creem (payments), Vercel
            (hosting and analytics), Neon (database) and DeepSeek (the AI model
            that generates your copy). Your product descriptions are sent to
            the AI provider solely to generate your copy.
          </p>

          <h2 className={标题}>6. Data retention and deletion</h2>
          <p className={段落}>
            We keep your data while your account is active. You may request
            full account and data deletion at any time by emailing{" "}
            <a href="mailto:271811038@qq.com" className="underline">271811038@qq.com</a> —
            we will delete your account and all associated content within 7 days.
          </p>

          <h2 className={标题}>7. Cookies</h2>
          <p className={段落}>
            We use only the essential cookies required to keep you logged in.
            No advertising or cross-site tracking cookies.
          </p>

          <h2 className={标题}>8. Changes to this policy</h2>
          <p className={段落}>
            If we change this policy, we will update the date at the top of this
            page. Continued use of CopyBoss after a change means you accept the
            updated policy.
          </p>
        </div>
      </main>
    </div>
  );
}
