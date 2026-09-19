// 注意：没有 "use client" —— 这是一个纯展示页面，数据是死的，不需要交互

import Link from "next/link";

// 类型定义：一条历史文案长什么样
type 历史条目 = {
  id: string;
  时间: string;
  平台: string;
  风格: string;
  摘要: string;
};

// mock 数据（暂时写死在文件里，以后从数据库读）
const 历史: 历史条目[] = [
  {
    id: "1",
    时间: "今天 21:23",
    平台: "小红书",
    风格: "亲切口语",
    摘要: "用了三个月，我脸上那两片斑真的淡了。以前出门必化妆，现在素颜敢出门……（展开）",
  },
  {
    id: "2",
    时间: "今天 21:20",
    平台: "公众号",
    风格: "专业干货",
    摘要: "内容营销的 3 个隐形坑：选题对了但开场太长；价值给了但节奏太密；转化没问但话术太硬……（展开）",
  },
  {
    id: "3",
    时间: "今天 20:47",
    平台: "抖音文案",
    风格: "幽默吐槽",
    摘要: "你以为老板赚的是钱吗？赚的是凌晨三点还在改方案的「执着」——3 个过来人血泪教训……（展开）",
  },
  {
    id: "4",
    时间: "昨天 22:11",
    平台: "公众号",
    风格: "情绪共鸣",
    摘要: "创业第 7 年，我想对你说：别相信「坚持就是胜利」，坚持只是最低门槛……（展开）",
  },
];

export default function HistoryPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
      {/* 标题 */}
      <div className="mb-8 flex flex-col gap-2">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          历史文案
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          你之前生成过的文案都在这里，不会丢。
        </p>
      </div>

      {/* 列表 */}
      {历史.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-black/15 text-sm text-zinc-400 dark:border-white/20 dark:text-zinc-500">
          <p>还没有历史。</p>
          <Link href="/generate" className="text-black underline dark:text-zinc-200">
            去生成第一条 →
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {历史.map((条) => (
            <article
              key={条.id}
              className="rounded-xl border border-black/10 p-4 transition-colors hover:border-black/30 dark:border-white/15 dark:hover:border-white/30"
            >
              <div className="mb-2 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{条.时间}</span>
                <div className="flex gap-2">
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {条.平台}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 dark:bg-zinc-800">
                    {条.风格}
                  </span>
                </div>
              </div>
              <p className="text-sm leading-6 text-black dark:text-zinc-100">{条.摘要}</p>
            </article>
          ))}
        </div>
      )}

      {/* 底部提示 */}
      <p className="mt-8 text-center text-xs text-zinc-400 dark:text-zinc-500">
        提示：每条文案右侧以后会加「收藏」「复制」「删除」按钮。
      </p>
    </main>
  );
}