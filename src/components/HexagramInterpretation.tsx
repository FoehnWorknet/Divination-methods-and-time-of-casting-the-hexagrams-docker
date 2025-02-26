'use client'

import { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { HexagramData, hexagramData as hexagramDataMap } from '@/data/ichingData'
import { getHexagramKey } from '@/utils/iching'
import { generateYaoPrompt, generateHexagramPrompt } from '@/utils/aiClient'
import AIChatDialog from './AIChatDialog'
import HexagramMindmap from './HexagramMindmap'

interface HexagramInterpretationProps {
  upperTrigram?: string
  lowerTrigram?: string
  changingLine?: number
  isChangedHexagram?: boolean
  apiKey?: string
}

export default function HexagramInterpretation({
  upperTrigram,
  lowerTrigram,
  changingLine,
  isChangedHexagram = false,
  apiKey = ''
}: HexagramInterpretationProps) {
  const [selectedYao, setSelectedYao] = useState<number | null>(null)
  const [isOverallChatOpen, setIsOverallChatOpen] = useState(false)
  const [isYaoChatOpen, setIsYaoChatOpen] = useState(false)
  const [showMindmap, setShowMindmap] = useState(false)
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])

  if (!upperTrigram || !lowerTrigram) return null

  const hexagramKey = getHexagramKey(upperTrigram, lowerTrigram)
  const currentHexagram = hexagramDataMap[hexagramKey]
  
  if (!currentHexagram) {
    console.error('No hexagram data found for:', { upperTrigram, lowerTrigram, key: hexagramKey })
    return null
  }

  const handleYaoClick = useCallback((index: number) => {
    setSelectedYao(index)
    setIsYaoChatOpen(true)
  }, [])

  const handleChatMessage = useCallback((message: { role: string; content: string }) => {
    setChatHistory(prev => [...prev, message])
  }, [])

  const getYaoInterpretation = useCallback((lineNumber: number) => {
    return currentHexagram.yao[lineNumber - 1]
  }, [currentHexagram])

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-8 p-4 bg-white rounded-lg shadow-md"
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">
          {currentHexagram.name} - {currentHexagram.nature}
          {isChangedHexagram && changingLine && (
            <span className="text-yellow-600 text-base ml-2">
              (由第{changingLine}爻变来)
            </span>
          )}
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMindmap(!showMindmap)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            {showMindmap ? '隐藏思维导图' : '显示思维导图'}
          </button>
          <button
            onClick={() => setIsOverallChatOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            AI总体解析
          </button>
        </div>
      </div>
      
      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-2">卦辞</h4>
        <p className="text-gray-700">{currentHexagram.description}</p>
      </div>

      {changingLine && !isChangedHexagram && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold mb-2">动爻</h4>
          <div className="bg-yellow-50 p-4 rounded">
            <p className="font-medium text-gray-900">
              {getYaoInterpretation(changingLine).original}
            </p>
            <p className="text-gray-600 mt-2">
              {getYaoInterpretation(changingLine).modern}
            </p>
          </div>
        </div>
      )}

      <div>
        <h4 className="text-lg font-semibold mb-2">爻辞</h4>
        <div className="space-y-4">
          {currentHexagram.yao.map((yao, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleYaoClick(index)}
              className={`p-3 rounded cursor-pointer transition-colors hover:bg-gray-50 ${
                changingLine === index + 1 ? 'bg-yellow-50' : 'bg-gray-50'
              }`}
            >
              <p className="font-medium text-gray-900">
                {yao.original}
                {changingLine === index + 1 && (
                  <span className="text-yellow-600 ml-2">(动爻)</span>
                )}
              </p>
              <p className="text-gray-600 mt-1">{yao.modern}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {showMindmap && apiKey && (
        <HexagramMindmap 
          hexagram={currentHexagram} 
          apiKey={apiKey} 
          chatHistory={chatHistory.length > 0 ? chatHistory : undefined}
          isChangedHexagram={isChangedHexagram}
          changingLine={changingLine}
        />
      )}

      {/* AI解析对话框 */}
      <AIChatDialog
        isOpen={isOverallChatOpen}
        onClose={() => setIsOverallChatOpen(false)}
        initialPrompt={generateHexagramPrompt(currentHexagram)}
        apiKey={apiKey}
        onMessage={handleChatMessage}
      />

      {selectedYao !== null && (
        <AIChatDialog
          isOpen={isYaoChatOpen}
          onClose={() => setIsYaoChatOpen(false)}
          initialPrompt={generateYaoPrompt(currentHexagram.yao[selectedYao])}
          apiKey={apiKey}
          onMessage={handleChatMessage}
        />
      )}
    </motion.div>
  )
}