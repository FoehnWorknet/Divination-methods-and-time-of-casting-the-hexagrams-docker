'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { generateRandomHexagrams } from '@/utils/randomHexagrams'
import Hexagram from './Hexagram'
import { getHexagramFromTrigrams } from '@/utils/iching'
import { HexagramData } from '@/data/ichingData'

export default function RandomHexagrams() {
  const [hexagrams, setHexagrams] = useState<HexagramData[]>([])

  useEffect(() => {
    setHexagrams(generateRandomHexagrams())
  }, [])

  return (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-center mb-6">随机卦象</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {hexagrams.map((hexagram, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white p-6 rounded-lg shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold">{hexagram.name}</h3>
                <p className="text-sm text-gray-600">{hexagram.nature}</p>
              </div>
              <div className="w-24">
                <Hexagram 
                  value={getHexagramFromTrigrams(
                    hexagram.nature.slice(0, 1),
                    hexagram.nature.slice(2, 3)
                  )} 
                />
              </div>
            </div>
            <p className="text-gray-700">{hexagram.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}