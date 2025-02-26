export function singleOperation(sticks: number): { result: number; steps: any[] } {
  const steps = []
  
  const a = Math.floor(Math.random() * (sticks - 1)) + 1
  steps.push({
    description: `随机分成两堆，第一堆`,
    value: a
  })
  
  const b = sticks - a
  steps.push({
    description: `第二堆`,
    value: b
  })
  
  const c = Math.random() < 0.5 ? a - 1 : b - 1
  steps.push({
    description: `随机选择一堆减一`,
    value: c
  })
  
  const remainder1 = (c === a - 1) ? b % 4 : a % 4
  const remainder2 = c % 4
  steps.push({
    description: `计算两堆除4的余数`,
    value: `${remainder1}, ${remainder2}`
  })
  
  const result = 1 + (remainder1 === 0 ? 4 : remainder1) + (remainder2 === 0 ? 4 : remainder2)
  steps.push({
    description: `计算最终数字`,
    value: result
  })
  
  return { result, steps }
}

export function tripleOperation(initialSticks: number): { result: number; steps: any[] } {
  let sticks = initialSticks
  const steps = []
  steps.push({
    description: `初始棒数`,
    value: sticks
  })
  
  for (let i = 0; i < 3; i++) {
    const { result, steps: roundSteps } = singleOperation(sticks)
    steps.push({
      description: `第${i + 1}轮演算`,
      value: `减去${result}根，剩余${sticks - result}根`
    })
    steps.push(...roundSteps)
    sticks -= result
  }
  
  const result = Math.floor(sticks / 4)
  steps.push({
    description: `最终数除以4`,
    value: result
  })
  
  return { result, steps }
}

export function generateYao(): { yao: number; steps: any[] } {
  const { result, steps } = tripleOperation(49)
  const yao = (() => {
    switch (result) {
      case 6: return 6  // 老阴
      case 7: return 7  // 少阳
      case 8: return 8  // 少阴
      case 9: return 9  // 老阳
      default: return 0 // 错误
    }
  })()
  
  steps.push({
    description: `根据结果确定爻的性质`,
    value: getYaoName(yao)
  })
  
  return { yao, steps }
}

// 地支转数字映射
const earthlyBranchToNumber: { [key: string]: number } = {
  '子': 1, '丑': 2, '寅': 3, '卯': 4, '辰': 5, '巳': 6,
  '午': 7, '未': 8, '申': 9, '酉': 10, '戌': 11, '亥': 12
}

// 计算上卦数值（使用农历数据）
export function calculateUpperTrigramValue(yearBranch: string, lunarMonth: string, lunarDay: string): { value: number; steps: any[] } {
  const steps = []
  
  // 将年支转换为数字（1-12）
  const yearValue = earthlyBranchToNumber[yearBranch] || 0
  steps.push({
    description: '年支转数值',
    value: `${yearBranch} → ${yearValue}`
  })

  // 获取农历月
  const monthValue = parseInt(lunarMonth) || 0
  steps.push({
    description: '农历月',
    value: monthValue
  })

  // 获取农历日
  const dayValue = parseInt(lunarDay) || 0
  steps.push({
    description: '农历日',
    value: dayValue
  })

  // 计算总和
  const sum = yearValue + monthValue + dayValue
  steps.push({
    description: '计算上卦数值',
    value: `${yearValue} + ${monthValue} + ${dayValue} = ${sum}`
  })

  return { value: sum, steps }
}

// 计算下卦数值（使用时辰）
export function calculateLowerTrigramValue(upperSum: number, hourBranch: string): { value: number; steps: any[] } {
  const steps = []

  // 将时辰转换为数字（1-12）
  const hourValue = earthlyBranchToNumber[hourBranch] || 0
  steps.push({
    description: '时辰转数值',
    value: `${hourBranch} → ${hourValue}`
  })

  // 计算总和
  const sum = upperSum + hourValue
  steps.push({
    description: '计算下卦数值',
    value: `${upperSum} + ${hourValue} = ${sum}`
  })

  return { value: sum, steps }
}

export function calculateTrigram(sum: number): string {
  // 确保余数为正数（1-8）
  const remainder = ((sum - 1) % 8) + 1
  const trigramMap: { [key: number]: string } = {
    1: "坎", 2: "坤", 3: "震", 4: "巽",
    5: "乾", 6: "兑", 7: "艮", 8: "离"
  }
  return trigramMap[remainder]
}

export function calculateChangingLine(sum: number): number {
  // 确保余数为正数（1-6）
  return ((sum - 1) % 6) + 1
}

// 八卦数值映射
const trigramToNumber: Record<string, number> = {
  "乾": 0b111, "兑": 0b011, "离": 0b101, "震": 0b001,
  "巽": 0b110, "坎": 0b010, "艮": 0b100, "坤": 0b000
}

const numberToTrigram: Record<number, string> = {
  0b111: "乾", 0b011: "兑", 0b101: "离", 0b001: "震",
  0b110: "巽", 0b010: "坎", 0b100: "艮", 0b000: "坤"
}

export function getHexagramFromTrigrams(upper: string, lower: string): number {
  if (!upper || !lower || !trigramToNumber.hasOwnProperty(upper) || !trigramToNumber.hasOwnProperty(lower)) {
    console.error('Invalid trigram:', { upper, lower })
    return 0
  }
  return (trigramToNumber[upper] << 3) | trigramToNumber[lower]
}

export function getChangedHexagram(hexagram: number, changingLine: number): number {
  if (!validateHexagram(hexagram) || changingLine < 1 || changingLine > 6) {
    console.error('Invalid hexagram or changing line:', { hexagram, changingLine })
    return hexagram
  }
  // 从下往上数，所以changingLine从1开始
  const mask = 1 << (changingLine - 1)
  return hexagram ^ mask
}

export function getTrigramsFromHexagram(hexagram: number): { upper: string; lower: string } | undefined {
  if (typeof hexagram !== 'number' || hexagram < 0 || hexagram > 0b111111) {
    console.error('Invalid hexagram value:', hexagram)
    return undefined
  }

  const upperValue = (hexagram >> 3) & 0b111
  const lowerValue = hexagram & 0b111
  
  const upper = numberToTrigram[upperValue]
  const lower = numberToTrigram[lowerValue]
  
  if (!upper || !lower) {
    console.error('Invalid trigram values:', { upperValue, lowerValue })
    return undefined
  }
  
  return { upper, lower }
}

export function getYaoName(yao: number): string {
  switch (yao) {
    case 6: return "老阴"
    case 7: return "少阳"
    case 8: return "少阴"
    case 9: return "老阳"
    default: return "错误"
  }
}

export function getHexagramName(hexagram: number): string {
  const trigrams = getTrigramsFromHexagram(hexagram)
  if (!trigrams) return "未知"
  return `${trigrams.upper}${trigrams.lower}`
}

export function validateHexagram(hexagram: number): boolean {
  if (typeof hexagram !== 'number' || hexagram < 0 || hexagram > 0b111111) {
    return false
  }
  const trigrams = getTrigramsFromHexagram(hexagram)
  return trigrams !== undefined
}

export function validateHexagramData(data: Record<string, any>): boolean {
  const keys = Object.keys(data)
  const uniqueKeys = new Set(keys)
  
  if (keys.length !== uniqueKeys.size) {
    const duplicates = keys.filter((key, index) => keys.indexOf(key) !== index)
    console.error('Duplicate hexagram keys found:', duplicates)
    return false
  }
  
  return true
}

export function getHexagramKey(upperTrigram: string, lowerTrigram: string): string {
  return `${upperTrigram}${lowerTrigram}`
}