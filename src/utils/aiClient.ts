import { HexagramData, YaoData } from '@/data/ichingData';

const API_URL = 'https://api.siliconflow.cn/v1';
const MODEL = 'Pro/deepseek-ai/DeepSeek-R1';

export async function* streamAIResponse(prompt: string, apiKey: string, history: { role: string; content: string }[] = []): AsyncGenerator<string, void, unknown> {
  try {
    if (!apiKey) {
      throw new Error('API Key is required');
    }

    const messages = [
      {
        role: 'system',
        content: '你是一位精通易经的专家，你熟读穷通宝典、三命通会、滴天髓、渊海子平、千里命稿、协纪辨方书、果老星宗、子平真栓、神峰通考等一系列书籍。擅长解读卦象和爻辞，并能将古老的智慧应用到现代生活中。请直接输出解析内容，不要使用任何特殊标记或标签。'
      },
      ...history,
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: true
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'API request failed');
    }

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let currentResponse = '';
    let lastYieldTime = Date.now();
    const MIN_YIELD_INTERVAL = 100; // 最小输出间隔（毫秒）
    let accumulatedChars = '';

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine === 'data: [DONE]') continue;

        try {
          const data = JSON.parse(trimmedLine.replace(/^data: /, ''));
          if (data.choices?.[0]?.delta?.content) {
            const chunk = data.choices[0].delta.content;
            // 移除任何可能的特殊标记
            const cleanChunk = chunk.replace(/<think>.*?<\/think>/g, '');
            accumulatedChars += cleanChunk;
            currentResponse += cleanChunk;

            // 根据时间间隔和累积的字符数来决定是否输出
            const now = Date.now();
            if (now - lastYieldTime >= MIN_YIELD_INTERVAL && accumulatedChars.length > 0) {
              // 在句子或段落的自然断点处输出
              const breakPoints = accumulatedChars.match(/[。！？\.!?\n]+/g);
              if (breakPoints) {
                yield currentResponse;
                lastYieldTime = now;
                accumulatedChars = '';
              } else if (accumulatedChars.length >= 10) {
                // 如果累积了足够多的字符但没有断点，也进行输出
                yield currentResponse;
                lastYieldTime = now;
                accumulatedChars = '';
              }
            }
          }
        } catch (e) {
          console.warn('Failed to parse chunk:', trimmedLine);
        }
      }
    }

    // 确保最后的内容也被输出
    if (currentResponse && currentResponse !== '') {
      yield currentResponse;
    }

  } catch (error) {
    console.error('AI streaming error:', error);
    if (error instanceof Error) {
      yield `解析出现错误: ${error.message}`;
    } else {
      yield '解析出现错误，请稍后重试。';
    }
  }
}

// 其他函数保持不变...
export function generateYaoPrompt(yao: YaoData): string {
  return `请详细解释以下易经爻辞的含义，包括其象征意义和现代启示：

原文：${yao.original}
译文：${yao.modern}

请从以下几个方面进行分析：
1. 具体寓意：详细解释这条爻辞的具体含义
2. 象征含义：分析其象征和隐喻的深层意义
3. 现代生活的启示：如何将这条爻辞的智慧应用到现代生活中
4. 对个人发展的建议：基于这条爻辞，对个人成长和发展的具体建议

请直接输出解析内容，不要使用任何特殊标记或标签。请用清晰的语言和具体的例子来解释，让现代人能够理解和应用这些古老的智慧。`;
}

export function generateHexagramPrompt(hexagram: HexagramData): string {
  return `请对以下易经卦象进行全面解析：

卦名：${hexagram.name}
性质：${hexagram.nature}
卦辞：${hexagram.description}

请从以下几个方面进行详细分析：
1. 整体卦象的核心寓意
   - 本卦的基本含义
   - 卦辞的核心思想
   - 卦象所反映的基本情势

2. 各爻之间的关系和变化
   - 六爻的相互关系
   - 爻位的变化规律
   - 关键爻位的特殊意义

3. 对当前情况的指导意义
   - 对所处形势的判断
   - 当前应该注意的要点
   - 可能遇到的机遇和挑战

4. 未来发展的建议
   - 行动的指导原则
   - 具体的应对策略
   - 需要避免的问题

5. 现代生活中的具体应用
   - 在事业方面的启示
   - 在人际关系中的运用
   - 在个人修养上的指导

请直接输出解析内容，不要使用任何特殊标记或标签。请用现代人易于理解的语言来解释，并结合具体的例子说明如何在实际生活中运用这些智慧。`;
}