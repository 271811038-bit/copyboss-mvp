// 这是一个「可复用组件」：把胶囊按钮的视觉和行为封装在这里
// 任何地方想用胶囊，点 / 不点两种状态切换，都 import 它

type PillProps = {
  名称: string;
  已选: boolean;
  onClick: () => void;
};

export default function Pill({ 名称, 已选, onClick }: PillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        已选
          ? "rounded-full bg-black px-4 py-2 text-sm text-white transition-colors dark:bg-white dark:text-black"
          : "rounded-full border border-black/15 px-4 py-2 text-sm text-zinc-700 transition-colors hover:border-black/40 dark:border-white/20 dark:text-zinc-300 dark:hover:border-white/40"
      }
    >
      {已选 ? "✓ " : ""}
      {名称}
    </button>
  );
}