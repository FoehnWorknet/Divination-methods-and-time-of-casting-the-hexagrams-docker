'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { streamAIResponse } from '@/utils/aiClient'

interface Message {
  role: 'user' | 'assistant'
  content: string
  isComplete?: boolean
  isCollapsed?: boolean
}

interface AIChatDialogProps {
  isOpen: boolean
  onClose: () => void
  initialPrompt: string
  apiKey: string
  onMessage?: (message: { role: 'user' | 'assistant'; content: string }) => void
}

const debounce = (func: Function, wait: number) => {
  let timeout: NodeJS.Timeout
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export default function AIChatDialog({ isOpen, onClose, initialPrompt, apiKey, onMessage }: AIChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const currentResponseRef = useRef<string>('')

  const scrollToBottom = useRef(
    debounce(() => {
      if (containerRef.current) {
        const { scrollHeight, clientHeight } = containerRef.current
        containerRef.current.scrollTo({
          top: scrollHeight - clientHeight,
          behavior: 'smooth'
        })
      }
    }, 100)
  ).current

  // 重置对话状态
  useEffect(() => {
    if (isOpen) {
      setMessages([])
      currentResponseRef.current = ''
      if (initialPrompt) {
        handleSendMessage(initialPrompt)
      }
    }
  }, [isOpen, initialPrompt])

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom()
    }
  }, [messages])

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !apiKey) return

    const newMessages = [
      ...messages,
      { role: 'user' as const, content, isComplete: true }
    ]
    setMessages(newMessages)
    setUserInput('')
    setIsLoading(true)
    setIsThinking(true)
    currentResponseRef.current = ''

    if (onMessage) {
      onMessage({ role: 'user', content })
    }

    try {
      // 添加思考状态消息
      setMessages([
        ...newMessages,
        { 
          role: 'assistant', 
          content: '正在思考...', 
          isComplete: false,
          isCollapsed: true 
        }
      ])

      // 等待一段时间模拟思考
      await new Promise(resolve => setTimeout(resolve, 1500))
      setIsThinking(false)

      // 更新为正在输出状态
      setMessages(messages => [
        ...messages.slice(0, -1),
        { 
          role: 'assistant', 
          content: '正在输出...', 
          isComplete: false,
          isCollapsed: true 
        }
      ])

      // 开始流式输出
      for await (const chunk of streamAIResponse(content, apiKey, messages.slice(0, -1))) {
        currentResponseRef.current = chunk
        setMessages(messages => [
          ...messages.slice(0, -1),
          { 
            role: 'assistant', 
            content: currentResponseRef.current, 
            isComplete: false,
            isCollapsed: true 
          }
        ])
      }

      // 标记消息为完成状态
      const finalMessage: Message = { 
        role: 'assistant', 
        content: currentResponseRef.current, 
        isComplete: true,
        isCollapsed: true 
      }
      
      setMessages(messages => [
        ...messages.slice(0, -1),
        finalMessage
      ])

      if (onMessage) {
        onMessage({ role: 'assistant', content: currentResponseRef.current })
      }

    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(messages => [
        ...messages.slice(0, -1),
        { 
          role: 'assistant', 
          content: '抱歉，解析过程出现错误，请稍后重试。',
          isComplete: true,
          isCollapsed: false
        }
      ])
    } finally {
      setIsLoading(false)
      setIsThinking(false)
    }
  }

  const toggleMessageCollapse = (index: number) => {
    setMessages(messages => 
      messages.map((msg, i) => 
        i === index ? { ...msg, isCollapsed: !msg.isCollapsed } : msg
      )
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userInput.trim()) {
      handleSendMessage(userInput)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col"
      >
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">AI 解析</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            关闭
          </button>
        </div>

        <div ref={containerRef} className="flex-1 overflow-y-auto p-4 scroll-smooth">
          <AnimatePresence mode="wait">
            {messages.map((message, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className={`mb-4 ${
                  message.role === 'user' ? 'text-right' : 'text-left'
                }`}
              >
                <div
                  onClick={() => {
                    if (message.role === 'assistant' && message.isComplete) {
                      toggleMessageCollapse(index)
                    }
                  }}
                  className={`inline-block max-w-[80%] p-3 rounded-lg transition-colors ${
                    message.role === 'user'
                      ? 'bg-green-500 text-white'
                      : message.isComplete
                      ? 'bg-green-100 hover:bg-green-200 cursor-pointer'
                      : 'bg-gray-100'
                  } ${message.role === 'assistant' && message.isComplete ? 'cursor-pointer' : ''}`}
                >
                  {message.role === 'assistant' && message.isComplete && message.isCollapsed ? (
                    <div className="flex items-center">
                      <span>点击展开查看回复内容</span>
                      <motion.span
                        animate={{ rotate: message.isCollapsed ? 0 : 180 }}
                        className="ml-2"
                      >
                        ▼
                      </motion.span>
                    </div>
                  ) : (
                    <>
                      {message.content}
                      {message.role === 'assistant' && !message.isComplete && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: [0, 1, 0] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="inline-block ml-1"
                        >
                          ▋
                        </motion.span>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="输入您的问题..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !userInput.trim()}
              className={`px-6 py-2 rounded-lg transition-colors ${
                isLoading || !userInput.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              发送
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}