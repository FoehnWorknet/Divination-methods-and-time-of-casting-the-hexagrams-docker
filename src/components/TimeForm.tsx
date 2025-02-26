'use client'

import { useState } from 'react'
import { getLunarDate } from '@/utils/lunarCalendar'

interface TimeFormProps {
  onSubmit: (date?: Date) => void
}

export default function TimeForm({ onSubmit }: TimeFormProps) {
  const [year, setYear] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [hour, setHour] = useState('')
  const [lunarInfo, setLunarInfo] = useState<{
    yearHeavenlyStem: string;
    yearEarthlyBranch: string;
    monthHeavenlyStem: string;
    monthEarthlyBranch: string;
    dayHeavenlyStem: string;
    dayEarthlyBranch: string;
    hourHeavenlyStem: string;
    hourEarthlyBranch: string;
    error?: string;
  } | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (year && month && day && hour) {
      const date = new Date()
      date.setFullYear(parseInt(year))
      date.setMonth(parseInt(month) - 1)
      date.setDate(parseInt(day))
      date.setHours(parseInt(hour))

      try {
        const lunarDate = await getLunarDate(date)
        if (lunarDate.error) {
          setError(lunarDate.error)
          return
        }
        
        setLunarInfo(lunarDate)
        onSubmit(date)
      } catch (err) {
        setError(err instanceof Error ? err.message : '转换农历日期失败')
      }
    } else {
      onSubmit()
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2 justify-center">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="年"
            className="w-20 px-2 py-1 border rounded text-center"
            min="1"
          />
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="月"
            className="w-16 px-2 py-1 border rounded text-center"
            min="1"
            max="12"
          />
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="日"
            className="w-16 px-2 py-1 border rounded text-center"
            min="1"
            max="31"
          />
          <input
            type="number"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            placeholder="时"
            className="w-16 px-2 py-1 border rounded text-center"
            min="0"
            max="23"
          />
        </div>
        <button
          type="submit"
          className="w-32 mx-auto block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
        >
          开始占卜
        </button>
      </form>

      {error && (
        <div className="text-red-500 text-center">
          {error}
        </div>
      )}

      {lunarInfo && (
        <div className="mt-6">
          <table className="w-full max-w-lg mx-auto border-collapse">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-50">柱</th>
                <th className="border p-2 bg-gray-50">年柱</th>
                <th className="border p-2 bg-gray-50">月柱</th>
                <th className="border p-2 bg-gray-50">日柱</th>
                <th className="border p-2 bg-gray-50">时柱</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border p-2 font-medium">天干</td>
                <td className="border p-2">{lunarInfo.yearHeavenlyStem}</td>
                <td className="border p-2">{lunarInfo.monthHeavenlyStem}</td>
                <td className="border p-2">{lunarInfo.dayHeavenlyStem}</td>
                <td className="border p-2">{lunarInfo.hourHeavenlyStem}</td>
              </tr>
              <tr>
                <td className="border p-2 font-medium">地支</td>
                <td className="border p-2">{lunarInfo.yearEarthlyBranch}</td>
                <td className="border p-2">{lunarInfo.monthEarthlyBranch}</td>
                <td className="border p-2">{lunarInfo.dayEarthlyBranch}</td>
                <td className="border p-2">{lunarInfo.hourEarthlyBranch}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}