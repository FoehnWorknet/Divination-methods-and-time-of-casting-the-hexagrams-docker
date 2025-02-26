import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '易经占卜 - 双重算法',
  description: '基于铜钱和时间的易经占卜系统'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}