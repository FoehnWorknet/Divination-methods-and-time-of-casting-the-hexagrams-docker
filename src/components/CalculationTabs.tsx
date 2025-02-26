'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalculationTabsProps {
  steps: {
    title: string
    steps: { description: string; value: string | number }[]
  }[]
}

export default function CalculationTabs({ steps }: CalculationTabsProps) {
  const [activeTab, setActiveTab] = useState<'dayan' | 'meihua'>('dayan')
  const [isExpanded, setIsExpanded] = useState(false)

  const dayanSteps = steps.filter(step => step.title.includes('大衍筮法'))
  const meihuaSteps = steps.filter(step => step.title.includes('梅花易数'))

  return (
    <div className="mt-8">
      <motion.div
        className="rounded-lg shadow-sm border border-gray-200 overflow-hidden"
      >
        <div 
          className="px-4 py-3 bg-white flex justify-between items-center cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h2 className="text-xl font-semibold">计算过程</h2>
          <motion.svg
            animate={{ rotate: isExpanded ? 180 : 0 }}
            className="w-5 h-5 text-gray-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </motion.svg>
        </div>

        <motion.div
          initial={false}
          animate={{ 
            height: isExpanded ? 'auto' : 0,
            opacity: isExpanded ? 1 : 0
          }}
          className="overflow-hidden"
        >
          <div className="border-t border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('dayan')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'dayan'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                大衍筮法计算过程
              </button>
              <button
                onClick={() => setActiveTab('meihua')}
                className={`w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm ${
                  activeTab === 'meihua'
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                梅花易数计算过程
              </button>
            </nav>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="p-4 bg-gray-50"
            >
              <div className="space-y-4">
                {(activeTab === 'dayan' ? dayanSteps : meihuaSteps).map((process, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 shadow-sm">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">{process.title}</h3>
                    <div className="space-y-2">
                      {process.steps.map((step, stepIndex) => (
                        <div key={stepIndex} className="text-sm text-gray-600">
                          <span className="font-medium">步骤 {stepIndex + 1}:</span> {step.description}
                          <span className="font-mono ml-2">= {step.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}