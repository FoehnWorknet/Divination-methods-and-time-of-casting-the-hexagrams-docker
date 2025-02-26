'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { HexagramData } from '@/data/ichingData'
import * as d3 from 'd3'
import { Transformer } from 'markmap-lib'
import { Markmap } from 'markmap-view'

interface HexagramMindmapProps {
  hexagram: HexagramData
  apiKey: string
  chatHistory?: { role: string; content: string }[]
  isChangedHexagram?: boolean
  changingLine?: number
}

export default function HexagramMindmap({ 
  hexagram, 
  apiKey, 
  chatHistory,
  isChangedHexagram,
  changingLine 
}: HexagramMindmapProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const currentHexagramRef = useRef<string>('')
  const markmapInstanceRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const instanceKeyRef = useRef(`${hexagram.name}-${isChangedHexagram ? 'changed' : 'original'}`)

  useEffect(() => {
    const initializeMarkmap = async () => {
      try {
        if (!transformerRef.current) {
          transformerRef.current = new Transformer()
        }

        // 检查是否需要重新初始化
        const newInstanceKey = `${hexagram.name}-${isChangedHexagram ? 'changed' : 'original'}`
        if (instanceKeyRef.current !== newInstanceKey || !markmapInstanceRef.current) {
          instanceKeyRef.current = newInstanceKey
          
          if (svgRef.current) {
            // 清除 SVG 内容
            while (svgRef.current.firstChild) {
              svgRef.current.removeChild(svgRef.current.firstChild)
            }

            // 设置 SVG 属性
            svgRef.current.setAttribute('class', 'markmap-svg')
            svgRef.current.setAttribute('style', 'width: 100%; height: 100%;')

            markmapInstanceRef.current = Markmap.create(svgRef.current, {
              autoFit: true,
              duration: 500,
              maxWidth: 300,
              color: (node: any) => {
                const depth = node.depth
                const colors = ['#2563eb', '#059669', '#7c3aed', '#db2777', '#ea580c']
                return colors[depth % colors.length]
              }
            })

            // 生成新的思维导图
            generateMindmap()
          }
        }
      } catch (err) {
        console.error('Failed to initialize markmap:', err)
        setError('初始化思维导图失败')
      }
    }

    // 确保在组件挂载后初始化
    if (svgRef.current) {
      initializeMarkmap()
    }

    // 清理函数
    return () => {
      if (markmapInstanceRef.current) {
        markmapInstanceRef.current = null
      }
    }
  }, [hexagram.name, isChangedHexagram, apiKey, chatHistory])

  const formatMarkdownContent = (content: string): string => {
    // 移除可能的 Markdown 标记
    let formatted = content
      .replace(/^#+ /gm, '') // 移除标题标记
      .replace(/\*\*/g, '') // 移除粗体标记
      .replace(/\*/g, '') // 移除斜体标记
      .replace(/`/g, '') // 移除代码标记
      .trim()

    // 确保每行以 "- " 开头
    formatted = formatted.split('\n').map(line => {
      line = line.trim()
      if (!line) return ''
      return line.startsWith('- ') ? line : `- ${line}`
    }).join('\n')

    // 处理缩进
    const lines = formatted.split('\n')
    const result = []
    let currentIndent = 0
    let previousIndent = 0

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      // 计算当前行的缩进级别
      const indentMatch = line.match(/^(\s*)-/)
      currentIndent = indentMatch ? indentMatch[1].length : 0

      // 调整缩进
      if (i > 0) {
        if (currentIndent > previousIndent) {
          // 增加缩进
          currentIndent = previousIndent + 2
        } else if (currentIndent < previousIndent) {
          // 减少缩进
          currentIndent = Math.max(0, previousIndent - 2)
        }
      }

      // 构建新的行
      const indentedLine = `${' '.repeat(currentIndent)}- ${line.replace(/^[\s-]*/, '')}`
      result.push(indentedLine)
      previousIndent = currentIndent
    }

    return result.join('\n')
  }

  const updateMindmap = (content: string) => {
    if (!transformerRef.current || !markmapInstanceRef.current || !svgRef.current) return

    try {
      const formattedContent = formatMarkdownContent(content)
      const { root } = transformerRef.current.transform(formattedContent)
      markmapInstanceRef.current.setData(root)
      markmapInstanceRef.current.fit()
    } catch (err) {
      console.warn('Failed to update mindmap:', err)
      setError('更新思维导图时出错')
    }
  }

  const generateMindmap = async () => {
    setIsLoading(true)
    setError(null)

    let prompt = ''
    
    if (chatHistory && chatHistory.length > 0) {
      // 如果有对话历史，生成基于对话的思维导图
      prompt = `请根据以下易经卦象解析对话生成一个详细的思维导图，使用Markdown格式的多级列表（只使用"-"符号作为列表标记）。
      
对话内容：
${chatHistory.map(msg => `${msg.role === 'user' ? '问' : '答'}：${msg.content}`).join('\n\n')}

请从以下几个方面进行分析，使用树状结构展开：

- ${hexagram.name}卦${isChangedHexagram ? '变卦' : ''}对话总结
  - 关键问题
  - 主要解析
  - 重要启示
  - 实践建议
  - 补充说明

注意：
- 严格使用"-"作为列表标记
- 每个层级缩进两个空格
- 结构要清晰，层次分明
- 重点突出关键信息
- 使用简洁的语言
- 确保每个分支都有2-3个子节点`
    } else {
      // 默认生成卦象思维导图
      prompt = `请为以下易经卦象生成一个详细的思维导图，使用Markdown格式的多级列表（只使用"-"符号作为列表标记）：

卦名：${hexagram.name}${isChangedHexagram ? '（变卦）' : ''}
性质：${hexagram.nature}
卦辞：${hexagram.description}
${isChangedHexagram && changingLine ? `变爻：第${changingLine}爻` : ''}

爻辞：
${hexagram.yao.map((yao, index) => `第${index + 1}爻：${yao.original}
译文：${yao.modern}`).join('\n')}

请从以下几个方面进行分析，使用树状结构展开：

- ${hexagram.name}卦${isChangedHexagram ? '变卦' : ''}解析
  - 基本信息
  - 卦象含义
  - 卦辞解读
  - 六爻详解
  ${isChangedHexagram ? '  - 变爻影响\n  - 变化意义' : '  - 变化规律\n  - 现代启示'}

注意：
- 严格使用"-"作为列表标记
- 每个层级缩进两个空格
- 结构要清晰，层次分明
- 重点突出关键信息
- 使用简洁的语言
- 确保每个分支都有2-3个子节点`
    }

    try {
      const response = await fetch('https://api.siliconflow.cn/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'Pro/deepseek-ai/DeepSeek-V3',
          messages: [
            {
              role: 'system',
              content: '你是一位精通易经的专家，擅长用思维导图的形式展示易经的智慧。请严格按照要求的格式输出思维导图内容，只使用"-"作为列表标记。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
          stream: true
        })
      })

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let content = ''

      if (!reader) {
        throw new Error('Failed to get response reader')
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const jsonString = line.slice(5).trim()
            if (jsonString === '[DONE]') continue

            try {
              const json = JSON.parse(jsonString)
              if (json.choices?.[0]?.delta?.content) {
                content += json.choices[0].delta.content
                updateMindmap(content)
              }
            } catch (e) {
              console.warn('Failed to parse chunk:', jsonString)
            }
          }
        }
      }
    } catch (err) {
      console.error('Error generating mindmap:', err)
      setError(err instanceof Error ? err.message : '生成思维导图时出错')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        className="bg-white rounded-lg shadow-md p-4"
      >
        <h2 className="text-xl font-bold mb-4">
          {chatHistory && chatHistory.length > 0 ? '对话总结思维导图' : `${hexagram.name}卦${isChangedHexagram ? '变卦' : ''}思维导图`}
        </h2>
        
        {isLoading && (
          <div className="text-center text-gray-600">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="inline-block w-6 h-6 border-2 border-gray-300 border-t-green-500 rounded-full"
            />
            <p className="mt-2">正在生成思维导图...</p>
          </div>
        )}

        {error && (
          <div className="text-red-500 text-center p-4">
            {error}
          </div>
        )}

        <div className="markmap-container w-full h-[600px] border border-gray-200 rounded-lg overflow-hidden">
          <svg ref={svgRef} />
        </div>
      </motion.div>
    </div>
  )
}