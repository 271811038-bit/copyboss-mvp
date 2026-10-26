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
  Instagram:
    "Instagram post style: catchy hook-style caption with 1-3 relevant emojis, short punchy paragraphs with line breaks, authentic storytelling feel, end with a call-to-action and 8-12 niche hashtags (#hashtag format, mix big and small tags), total length 100-220 words.",
  TikTok:
    "TikTok video script style: the first 3 seconds must have a strong hook (question/conflict/unexpected claim), fast pacing, short sentences, vivid and conversational like talking to a friend, spoken-word format, end with a call-to-action to follow, and append 3-5 niche hashtags (#hashtag format) at the end, total length 60-140 words.",
  LinkedIn:
    "LinkedIn post style: professional but human tone, opens with a strong insight or contrarian take, clear structure with short paragraphs, shares concrete value or lessons learned, ends with a question to spark discussion, minimal hashtags (3-5), total length 120-250 words.",
  X: "X (Twitter) post style: under 280 characters, one sharp idea per post, punchy and quotable, strong hook in the first line, optionally 1-2 emojis and up to 2 hashtags, no fluff.",
  YouTube:
    "YouTube video script style: hook in the first 5 seconds promising the payoff, clear section structure with timestamps-friendly transitions, conversational and energetic, end with subscribe call-to-action and include 2-3 hashtags at the end, total length 120-250 words.",
};

const 风格规矩: Record<string, string> = {
  Friendly: "Tone like chatting with a close friend, use \"you\", casual and warm, light internet slang is fine but don't overdo it.",
  Professional: "Credible expert tone, give concrete methods and data, make readers feel they learned something actionable.",
  Witty: "Self-aware humor with clever observations, make them laugh first then sell, but keep the jokes harmless and never punch down.",
  Story: "Start with a real painful-moment scenario the target user recognizes, build emotional resonance, then naturally introduce the product as the way out.",
};

// 岗位说明书（system prompt）——一次写好，每次生成都用
const 岗位说明书 = `You are a senior social-media copywriter serving small business owners and solo creators.
Your task: based on the given product info, platform and tone, write ready-to-publish marketing copy that brings customers.

Strict requirements (violating any single one means failure):
1. Content must be based on the real selling points in the product info — never invent features or make exaggerated promises.
2. Strictly follow the specified platform's content format and the specified tone.
3. Each copy variation must be self-contained and approach the product from a different angle.
4. Write the copy in English unless the product description is written in another language — in that case, match that language.
5. **Output MUST be a strict JSON array** — this is the most important hard rule:
   - The number of string elements in the array = the number of copy variations. Never merge multiple variations into one string.
   - Each string element is one complete piece of copy (including headline and body). Never use --- or newlines to separate multiple pieces inside one element.
   - Separate array elements with commas.
   - Escape newlines inside strings as \\n.
   - Absolutely NEVER output anything other than the JSON array (no explanations, no "Sure!", no markdown code fences).

Correct example (3 variations = 3 elements):
["Headline 1\\nBody paragraph 1\\nBody paragraph 2","Headline 2\\nBody paragraph 1\\nBody paragraph 2","Headline 3\\nBody paragraph 1\\nBody paragraph 2"]

Wrong example 1 (multiple pieces in one element, will be rejected):
["Headline 1\\nBody 1\\n---\\nHeadline 2\\nBody 2\\n---\\nHeadline 3\\nBody 3"]

Wrong example 2 (wrapped in a markdown code block, will be rejected):
\`\`\`json\\n["...","..."]\\n\`\`\``;

// 给 AI 的任务单（user prompt）——每次生成都现场拼装
function 拼任务单(参数: {
  产品: string;
  平台: string;
  风格: string;
  数量: number;
  语言?: string;
  品牌声音?: string;
}): string {
  // P2：输出语言（auto = 跟随产品描述语言，否则强制指定）
  const 语言指令 =
    !参数.语言 || 参数.语言 === "auto"
      ? "Write all copy in the same language as the product info (English if ambiguous)."
      : `Write ALL copy in ${参数.语言}, no matter what language the product info is in.`;

  // P1：品牌声音（用户保存的长期画像，注入到每次生成）
  const 品牌块 = 参数.品牌声音
    ? `\n\nBrand voice (saved by this user — follow it strictly in every variation):\n${参数.品牌声音}`
    : "";

  return `Product info: ${参数.产品}

Platform: ${参数.平台} (${平台规矩[参数.平台] || "General social media style, conversational and engaging."})
Tone: ${参数.风格} (${风格规矩[参数.风格] || "Natural and authentic."})
${品牌块}

Output language: ${语言指令}

Please write ${参数.数量} copy variations from different angles.
Use emojis naturally where the platform style calls for it (Instagram/TikTok: welcome; LinkedIn: sparingly; X: at most 1-2). Hashtags must be niche-relevant, never generic spam tags.

Format reminder once more: the output MUST be a JSON array of length ${参数.数量}, each element being one complete copy variation as a string. Example: ["copy 1","copy 2"].
The array length must be exactly ${参数.数量}, no more, no less.`;
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
  语言?: string;
  品牌声音?: string;
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
          { role: "user", content: 拼任务单(参数) },
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
    return `[Demo copy ${i + 1} | AI not connected] ${平台} copy (${风格} tone) for "${产品}". Add DEEPSEEK_API_KEY to your environment and real AI copy will appear here.`;
  });
}