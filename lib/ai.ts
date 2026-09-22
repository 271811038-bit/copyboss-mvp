// ============================================================
// lib/ai.ts —— AI 适配器（全项目唯一跟大模型打交道的地方）
//
// 设计原则（适配器模式）：
// - 外面的代码只调用 生成文案(参数)，不关心背后是 DeepSeek 还是 OpenAI
// - 想换供应商？只改这一个文件，其他代码一行不动
// - 没配置 API key 时自动降级为 mock 文案，保证流程永远能跑通
// ============================================================

// 每个平台对应一套"写作规矩"——这就是提示词工程的一部分：
// 不告诉 AI 平台特点，它就会写出"放到哪个平台都不合适"的通用废话
const 平台规矩: Record<string, string> = {
  小红书:
    "小红书笔记风格：标题带 emoji，正文口语化、真诚分享感，多用分段和短句，结尾带互动引导和相关话题标签（#标签 形式），总长度 150-300 字。",
  公众号:
    "公众号推文风格：标题吸引点击但不过分标题党，正文结构清晰、有小标题，观点明确，段落之间有逻辑递进，结尾引导关注或留言，总长度 300-500 字。",
  抖音文案:
    "抖音短视频口播文案风格：前 3 秒必须有钩子（提问/冲突/反常识），节奏快、句子短、有画面感，口语化像跟朋友聊天，结尾引导点赞关注，总长度 100-200 字。",
};

const 风格规矩: Record<string, string> = {
  亲切口语: "语气像闺蜜聊天，用「你」不用「您」，可以有一点网络用语但别过度。",
  专业干货: "语气专业可信，多给具体方法和数据，让读者觉得「学到了」。",
  幽默吐槽: "自带梗和自嘲，先笑后卖货，但吐槽要无害、不贬低任何人。",
  情绪共鸣: "先讲目标用户的真实痛点场景，再给情绪出口，最后自然带出产品。",
};

// 岗位说明书（system prompt）——一次写好，每次生成都用
const 岗位说明书 = `你是一位服务中小老板和自由职业者的资深新媒体文案。
你的任务：根据给到的产品信息、平台和风格，写出能直接发布、能带来客户的营销文案。
要求：
1. 内容必须基于产品信息里的真实卖点，不编造功能、不夸大承诺。
2. 严格遵守指定平台的内容格式和指定风格的语气。
3. 每条文案独立完整，互相不重复角度。
4. 输出必须是严格的 JSON 数组格式，数组里每个元素是一条完整文案的字符串，不要输出任何 JSON 以外的解释文字。`;

// 给 AI 的任务单（user prompt）——每次生成都现场拼装
function 拼任务单(产品: string, 平台: string, 风格: string, 数量: number): string {
  return `产品信息：${产品}

平台：${平台}（${平台规矩[平台] || "通用社交媒体风格"}）
风格：${风格}（${风格规矩[风格] || "自然真诚"}）

请写 ${数量} 条不同角度的文案。只输出 JSON 数组，例如 ["文案1", "文案2"]。`;
}

// 生成文案的类型：可能成功（文案数组），也可能失败（原因）
export type 生成结果 =
  | { ok: true; 文案: string[]; 用的AI: "deepseek" | "mock" }
  | { ok: false; 原因: string };

// ============================================================
// 主函数：生成一组文案
// ============================================================
export async function 生成文案(参数: {
  产品: string;
  平台: string;
  风格: string;
  数量: number;
}): Promise<生成结果> {
  const key = process.env.DEEPSEEK_API_KEY;

  // ① 没配 key → 降级为 mock（流程照跑，方便开发和无 key 演示）
  if (!key) {
    return {
      ok: true,
      用的AI: "mock",
      文案: mock文案(参数.产品, 参数.平台, 参数.风格, 参数.数量),
    };
  }

  // ② 有 key → 真调 DeepSeek
  try {
    const 响应 = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Bearer = "持卡人"。这行就是"刷电费卡"
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: 岗位说明书 },
          { role: "user", content: 拼任务单(参数.产品, 参数.平台, 参数.风格, 参数.数量) },
        ],
        // temperature：0=保守复读机，2=放飞自我。营销文案取 1.0 平衡创意和稳定
        temperature: 1.0,
      }),
    });

    if (!响应.ok) {
      return { ok: false, 原因: `DeepSeek 返回 ${响应.status}（可能是余额不足或 key 无效）` };
    }

    const 数据 = await 响应.json();
    const 原文: string = 数据.choices?.[0]?.message?.content ?? "";

    // AI 说好只回 JSON 数组，但要防它"不守规矩"——解析失败就降级
    const 文案 = 解析JSON数组(原文);
    if (!文案 || 文案.length === 0) {
      return { ok: false, 原因: "AI 返回的内容无法解析为文案列表" };
    }

    return { ok: true, 用的AI: "deepseek", 文案 };
  } catch (错误) {
    return { ok: false, 原因: `网络请求失败：${错误 instanceof Error ? 错误.message : "未知错误"}` };
  }
}

// 解析 AI 返回的 JSON 数组，容忍它偶尔在前后多嘴几句
function 解析JSON数组(原文: string): string[] | null {
  try {
    const 起点 = 原文.indexOf("[");
    const 终点 = 原文.lastIndexOf("]");
    if (起点 === -1 || 终点 === -1) return null;
    const 解析 = JSON.parse(原文.slice(起点, 终点 + 1));
    if (!Array.isArray(解析)) return null;
    return 解析.filter((条): 条 is string => typeof 条 === "string" && 条.trim().length > 0);
  } catch {
    return null;
  }
}

// mock 降级文案（没 key 时用，流程照跑）
function mock文案(产品: string, 平台: string, 风格: string, 数量: number): string[] {
  return Array.from({ length: 数量 }, (_, i) => {
    const 序 = i + 1;
    return `【演示文案 ${序}｜AI 未接入】产品「${产品}」的${平台}文案（${风格}风格）。在 .env.local 里填入 DEEPSEEK_API_KEY 后，这里就会变成真正的 AI 文案。`;
  });
}
