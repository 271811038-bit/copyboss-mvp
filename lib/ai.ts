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

严格要求（违反任何一条都视为失败）：
1. 内容必须基于产品信息里的真实卖点，不编造功能、不夸大承诺。
2. 严格遵守指定平台的内容格式和指定风格的语气。
3. 每条文案独立完整，互相不重复角度。
4. **输出必须是严格的 JSON 数组**——这是最重要的硬规则：
   - 数组里有几个字符串元素 = 几条独立文案，不允许把多条塞进同一个字符串里
   - 每个字符串元素是一条完整文案（含标题和正文），不允许用 --- 或换行符在同一个元素里分隔多条
   - 数组元素之间用半角逗号 , 分隔
   - 字符串内部的换行用 \\n 转义
   - 绝对不要输出 JSON 以外的任何文字（不要解释、不要 "好的"、不要 markdown 代码块）

正确示例（3 条就输出 3 个元素）：
["标题1\\n正文1第一段\\n正文1第二段","标题2\\n正文2第一段\\n正文2第二段","标题3\\n正文3第一段\\n正文3第二段"]

错误示例 1（多条塞一个元素，会被拒）：
["标题1\\n正文1\\n---\\n标题2\\n正文2\\n---\\n标题3\\n正文3"]

错误示例 2（外层包了 markdown 代码块，会被拒）：
\`\`\`json\\n["...","..."]\\n\`\`\``;

// 给 AI 的任务单（user prompt）——每次生成都现场拼装
function 拼任务单(产品: string, 平台: string, 风格: string, 数量: number): string {
  return `产品信息：${产品}

平台：${平台}（${平台规矩[平台] || "通用社交媒体风格"}）
风格：${风格}（${风格规矩[风格] || "自然真诚"}）

请写 ${数量} 条不同角度的文案。

再次强调输出格式：必须是长度为 ${数量} 的 JSON 数组，每个元素是一条完整文案的字符串。例如 ["文案1","文案2"]。
数组长度必须是 ${数量}，不多不少。`;
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

    // AI 说好只回 JSON 数组，但要防它"不守规矩"——解析器已内置多重 fallback
    const 文案 = 解析JSON数组(原文);
    if (!文案 || 文案.length === 0) {
      return { ok: false, 原因: "AI 返回的内容无法解析为文案列表" };
    }

    return { ok: true, 用的AI: "deepseek", 文案 };
  } catch (错误) {
    return { ok: false, 原因: `网络请求失败：${错误 instanceof Error ? 错误.message : "未知错误"}` };
  }
}

// ============================================================
// JSON 解析器——专门对付 AI 不守规矩的 4 种毛病
//
// 1. AI 偶尔在前后多嘴几句
// 2. AI 偶尔不转义真实换行符（宽松模式替换 LF 为 \\n）
// 3. AI 偶尔返回多个独立 JSON 数组（逐个解析、抽取字符串、再合并）
// 4. AI 偶尔包 markdown 代码块（去除 ```json ``` 包裹）
// 5. 兜底：AI 把多条塞进 1 个超长字符串，按 --- 或 **标题：** 拆分
// ============================================================
function 解析JSON数组(原文: string): string[] | null {
  // 先剥掉 markdown 代码块包裹
  const 清洗后 = 原文.replace(/```json?\s*/gi, "").replace(/```/g, "").trim();

  // 抠出所有独立的 [...] 片段
  const 片段们 = 抠所有数组片段(清洗后);
  if (片段们.length === 0) return null;

  // 对每个片段尝试严格/宽松解析，抽取字符串元素
  const 所有字符串: string[] = [];
  for (const 片段 of 片段们) {
    const 严格 = 尝试解析(片段);
    if (严格) {
      所有字符串.push(...严格);
      continue;
    }
    // 严格失败？宽松换行后再试
    const 宽松 = 片段.replace(/\r\n/g, "\\n").replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");
    const 宽松解析 = 尝试解析(宽松);
    if (宽松解析) {
      所有字符串.push(...宽松解析);
      continue;
    }
  }

  // 如果合并后只有 1 条且超长，尝试兜底拆分（AI 把多条塞进 1 个字符串）
  if (所有字符串.length === 1 && 所有字符串[0].length > 300) {
    const 拆出来 = 拆分长字符串(所有字符串[0]);
    if (拆出来.length > 1) return 拆出来;
  }

  return 所有字符串.length > 0 ? 所有字符串 : null;
}

// 从原文里抠出所有独立的 JSON 数组片段
function 抠所有数组片段(文本: string): string[] {
  const 片段们: string[] = [];
  let pos = 0;
  while (pos < 文本.length) {
    const 开 = 文本.indexOf("[", pos);
    if (开 === -1) break;
    const 闭 = 找配对右括号(文本, 开);
    if (闭 === -1) break;
    片段们.push(文本.slice(开, 闭 + 1));
    pos = 闭 + 1;
  }
  return 片段们;
}

// 从 [ 位置往右找配对 ]（处理嵌套 [ ] 和字符串内的 [ ]）
function 找配对右括号(文本: string, 开位置: number): number {
  let 深度 = 1;
  let i = 开位置 + 1;
  let 字符串内 = false;
  let 转义 = false;
  while (i < 文本.length) {
    const 字符 = 文本[i];
    if (转义) {
      转义 = false;
    } else if (字符 === "\\") {
      转义 = true;
    } else if (字符 === '"') {
      字符串内 = !字符串内;
    } else if (!字符串内) {
      if (字符 === "[") 深度++;
      else if (字符 === "]") {
        深度--;
        if (深度 === 0) return i;
      }
    }
    i++;
  }
  return -1;
}

function 尝试解析(切片: string): string[] | null {
  try {
    const 解析 = JSON.parse(切片);
    if (!Array.isArray(解析)) return null;
    return 解析.filter((条): 条 is string => typeof 条 === "string" && 条.trim().length > 0);
  } catch {
    return null;
  }
}

// 兜底拆分：AI 把多条文案塞进一个字符串时，按 --- 或 **标题：** 分割
function 拆分长字符串(长文: string): string[] {
  // 优先按 "---" 分割（AI 最常用的分隔符）
  let 块 = 长文.split(/\n\s*---\s*\n/);
  if (块.length > 1) return 块.map((s) => s.trim()).filter((s) => s.length > 0);

  // 兜底按 "**标题：**" 分割
  块 = 长文.split(/\n\s*\*\*标题[：:]\s*/);
  if (块.length > 1) {
    // 第一个块通常是开头寒暄，丢掉；后面的每个块前面补回 "**标题：**"
    return 块.slice(1).map((s) => "**标题：**" + s.trim()).filter((s) => s.length > 0);
  }

  // 实在拆不动就原样返回
  return [长文];
}

// mock 降级文案（没 key 时用，流程照跑）
function mock文案(产品: string, 平台: string, 风格: string, 数量: number): string[] {
  return Array.from({ length: 数量 }, (_, i) => {
    const 序 = i + 1;
    return `【演示文案 ${序}｜AI 未接入】产品「${产品}」的${平台}文案（${风格}风格）。在 .env.local 里填入 DEEPSEEK_API_KEY 后，这里就会变成真正的 AI 文案。`;
  });
}