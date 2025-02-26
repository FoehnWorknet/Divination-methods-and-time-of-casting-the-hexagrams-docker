'use client'

import { motion } from 'framer-motion'
import { getYaoName, getTrigramsFromHexagram } from '@/utils/iching'

interface HexagramProps {
  lines?: number[]
  value?: number
  showResult?: boolean
  changingLine?: number
  onTrigramsChange?: (upper: string, lower: string) => void
}

export default function Hexagram({ lines, value, showResult = false, changingLine, onTrigramsChange }: HexagramProps) {
  const getLines = () => {
    if (Array.isArray(lines)) {
      // 反转数组以正确显示爻的顺序（第1爻在底部）
      return [...lines].reverse()
    }
    if (typeof value === 'number') {
      // 从下往上读取每一爻的值，然后反转数组使第1爻在底部
      const hexLines = Array.from({ length: 6 }, (_, i) => ((value & (1 << i)) ? 7 : 8)).reverse()
      
      // 如果提供了回调函数，计算并传递卦象
      if (onTrigramsChange) {
        const trigrams = getTrigramsFromHexagram(value)
        if (trigrams) {
          onTrigramsChange(trigrams.upper, trigrams.lower)
        }
      }
      
      return hexLines
    }
    return []
  }

  const hexagramLines = getLines()

  const lineVariants = {
    hidden: { 
      opacity: 0, 
      x: -50,
      scale: 0.8
    },
    visible: (i: number) => ({ 
      opacity: 1, 
      x: 0,
      scale: 1,
      transition: { 
        duration: 0.5,
        delay: i * 0.15,
        ease: "easeOut"
      }
    })
  }

  const textVariants = {
    hidden: { 
      opacity: 0, 
      y: 20 
    },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5,
        delay: hexagramLines.length * 0.15
      }
    }
  }

  // 计算实际的动爻位置（从上往下数）
  const actualChangingLineIndex = changingLine ? 6 - changingLine : undefined

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center space-y-1">
        {hexagramLines.map((line, index) => (
          <motion.div
            key={index}
            custom={index}
            variants={lineVariants}
            initial="hidden"
            animate="visible"
            className={`hexagram-line relative ${index === actualChangingLineIndex ? 'bg-yellow-100 rounded-lg' : ''}`}
          >
            {line % 2 === 1 ? (
              <motion.div 
                className={`hexagram-line-yang ${index === actualChangingLineIndex ? 'bg-yellow-500' : ''}`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ 
                  duration: 0.3,
                  delay: index * 0.15 + 0.2,
                  ease: "easeOut"
                }}
              />
            ) : (
              <div className="hexagram-line-yin">
                <motion.div
                  className={index === actualChangingLineIndex ? 'bg-yellow-500' : ''}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.15 + 0.2,
                    ease: "easeOut"
                  }}
                />
                <motion.div
                  className={index === actualChangingLineIndex ? 'bg-yellow-500' : ''}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ 
                    duration: 0.3,
                    delay: index * 0.15 + 0.2,
                    ease: "easeOut"
                  }}
                />
              </div>
            )}
            {index === actualChangingLineIndex && (
              <div className="absolute -right-8 text-xs text-yellow-600 font-medium">
                动爻
              </div>
            )}
          </motion.div>
        ))}
      </div>
      {showResult && lines && lines.length > 0 && (
        <motion.p 
          variants={textVariants}
          initial="hidden"
          animate="visible"
          className="text-center text-gray-600 text-sm"
        >
          卦象（从下到上）：{[...lines].map(yao => getYaoName(yao)).join(' ')}
        </motion.p>
      )}
    </div>
  )
}