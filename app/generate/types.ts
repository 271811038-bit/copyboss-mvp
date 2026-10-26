// 生成功能共享类型（actions.ts 是 "use server" 文件，只能导出 async 函数，
// 所以类型和初始值放这里，供 action 和表单组件共用）

export type 文案条 = { 平台: string; 风格: string; 内容: string };

export type 额度快照 = {
  plan: string;
  已用: number;        // 今日已用 credits（1 credit = 1 平台 × 1 风格）
  剩余: number;        // 当日剩余 + 加油包剩余
  总数: number;        // 当日 credits 上限
  超额: boolean;
  加油包剩余?: number; // 加油包剩余 credits
  当日剩余?: number;   // 当日额度还剩多少（不含加油包）
};

// Server Action 返回的状态：表单提交后整页刷新（无 JS 时）也能拿到结果
export type 生成结果状态 = {
  error: string;          // 顶部红色错误（参数不全/额度不足/全组失败）
  文案们: 文案条[];        // 生成成功的文案
  错误们: string[];        // 部分组失败时的提示（一组失败不影响其他组）
  额度: 额度快照 | null;   // 生成后的最新额度；null = 还没生成过，显示页面初始值
  消耗?: number;          // 本次实际消耗的 credits（= 成功组合数）
};
