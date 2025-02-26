import { hexagramData, HexagramData } from '@/data/ichingData'

export function generateRandomHexagrams(count: number = 4): HexagramData[] {
  const hexagrams = Object.values(hexagramData)
  const result: HexagramData[] = []
  const used = new Set<number>()

  while (result.length < count && used.size < hexagrams.length) {
    const index = Math.floor(Math.random() * hexagrams.length)
    if (!used.has(index)) {
      used.add(index)
      result.push(hexagrams[index])
    }
  }

  return result
}