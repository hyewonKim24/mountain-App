export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import DiaryClient from '@/components/diary/DiaryClient'

export default function DiaryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>}>
      <DiaryClient />
    </Suspense>
  )
}
