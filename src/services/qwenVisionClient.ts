/**
 * Qwen Vision API Client
 * 使用 Qwen-VL 模型分析图片，提取标签和颜色
 */

import config from '../config.js';

const QWEN_API_BASE = 'https://dashscope.aliyuncs.com/compatible-mode/v1';

// 使用 qwen-vl-plus 作为默认模型，性价比较好
const DEFAULT_MODEL = 'qwen-vl-plus';

interface QwenVLMessage {
  role: 'system' | 'user' | 'assistant';
  content: Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >;
}

interface QwenVLResponse {
  id: string;
  choices: {
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface ImageAnalysisResult {
  // 图片描述
  descriptionEn: string;
  descriptionZh: string;
  // 多语言标签
  tagsEn: string[];
  tagsZh: string[];
  tagsJa: string[];
  // 颜色信息
  dominantColor: string;
  allColors: string[];
}

/**
 * 调用 Qwen-VL 分析图片
 */
async function callQwenVL(
  messages: QwenVLMessage[],
  options: { model?: string; maxTokens?: number } = {}
): Promise<string> {
  const apiKey = config.dashscopeApiKey;
  if (!apiKey) {
    throw new Error('DASHSCOPE_API_KEY is not set in environment variables');
  }

  const { model = DEFAULT_MODEL, maxTokens = 1024 } = options;

  const response = await fetch(`${QWEN_API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: maxTokens,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('[QwenVL] API error:', response.status, errorText);
    throw new Error(`Qwen VL API error: ${response.status} - ${errorText}`);
  }

  const data = (await response.json()) as QwenVLResponse;

  if (!data.choices || data.choices.length === 0) {
    throw new Error('Qwen VL API returned no choices');
  }

  return data.choices[0].message.content;
}

/**
 * 解析 JSON 响应，处理可能的 markdown 代码块
 */
function parseJsonResponse(response: string): unknown {
  let jsonStr = response.trim();

  // 移除可能的 markdown 代码块标记
  if (jsonStr.startsWith('```json')) {
    jsonStr = jsonStr.slice(7);
  } else if (jsonStr.startsWith('```')) {
    jsonStr = jsonStr.slice(3);
  }
  if (jsonStr.endsWith('```')) {
    jsonStr = jsonStr.slice(0, -3);
  }

  return JSON.parse(jsonStr.trim());
}

/**
 * 分析图片，提取描述、多语言标签和颜色
 */
export async function analyzeImage(
  imageUrl: string
): Promise<ImageAnalysisResult> {
  const prompt = `请仔细分析这张图片，返回JSON格式的结果，包含以下字段：

1. "descriptionEn": 用英文写一段简洁优美的图片描述（1-2句话，描述画面内容、氛围和艺术风格）
2. "descriptionZh": 用中文写一段简洁优美的图片描述（1-2句话，描述画面内容、氛围和艺术风格）
3. "tagsEn": 英文标签数组（15-25个），包含：主体对象、场景环境、艺术风格、情绪氛围、颜色、构图等
4. "tagsZh": 中文标签数组（15-25个），与英文标签对应
5. "tagsJa": 日文标签数组（15-25个），与英文标签对应
6. "dominantColor": 图片主色调，十六进制颜色代码（如 "#FF5733"）
7. "allColors": 图片主要颜色数组，3-5个十六进制颜色代码

标签要求：
- 按相关性从高到低排序
- 包含具体和抽象的描述词
- 适合用于图片搜索和分类

只返回JSON，不要其他文字。`;

  const messages: QwenVLMessage[] = [
    {
      role: 'user',
      content: [
        { type: 'image_url', image_url: { url: imageUrl } },
        { type: 'text', text: prompt },
      ],
    },
  ];

  try {
    const response = await callQwenVL(messages, { maxTokens: 2048 });
    const result = parseJsonResponse(response) as {
      descriptionEn?: string;
      descriptionZh?: string;
      tagsEn?: string[];
      tagsZh?: string[];
      tagsJa?: string[];
      dominantColor?: string;
      allColors?: string[];
    };

    return {
      descriptionEn: result.descriptionEn || '',
      descriptionZh: result.descriptionZh || '',
      tagsEn: result.tagsEn || [],
      tagsZh: result.tagsZh || [],
      tagsJa: result.tagsJa || [],
      dominantColor: result.dominantColor || '',
      allColors: result.allColors || [],
    };
  } catch (error) {
    console.error('[QwenVL] Failed to analyze image:', error);
    // 返回空结果而不是抛出错误，保持容错行为
    return {
      descriptionEn: '',
      descriptionZh: '',
      tagsEn: [],
      tagsZh: [],
      tagsJa: [],
      dominantColor: '',
      allColors: [],
    };
  }
}
