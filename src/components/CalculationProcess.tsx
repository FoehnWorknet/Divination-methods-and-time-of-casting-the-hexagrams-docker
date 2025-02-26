'use client'

import { motion } from 'framer-motion'

interface CalculationStep {
  description: string
  value: string | number
}

interface CalculationProcessProps {
  title: string
  steps: CalculationStep[]
}

export default function CalculationProcess({ title, steps }: CalculationProcessProps) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      className="mt-4 p-4 bg-gray-50 rounded-lg"
    >
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm text-gray-600"
          >
            <span className="font-medium">步骤 {index + 1}:</span> {step.description}
            <span className="font-mono ml-2">= {step.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}