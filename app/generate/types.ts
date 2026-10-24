// 生成功能共享类型（actions.ts 是 "use server" 文件，只能导出 async 函数，
// 所以类型和初始值放这里，供 action 和表单组件共用）

export type 文案条 = { 平台: string; 风格: string; 内容: string };

export type 额度快照 = {
  plan: string;
  已用: number;
  剩余: number;
  总数: number;
  超额: boolean;
  加油包剩余?: number; // 加油包（$1/10次）剩余次数，老数据可能没有该字段
};

// Server Action 返回的状态：表单提交后整页刷新（无 JS 时）也能拿到结果
export type 生成结果状态 = {
  error: string;          // 顶部红色错误（参数不全/额度用完/全组失败）
  文案们: 文案条[];        // 生成成功的文案
  错误们: string[];        // 部分组失败时的提示（一组失败不影响其他组）
  额度: 额度快照 | null;   // 生成后的最新额度；null = 还没生成过，显示页面初始值
};
