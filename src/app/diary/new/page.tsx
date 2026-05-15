export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import DiaryNewClient from '@/components/diary/DiaryNewClient'

export default function DiaryNewPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>}>
      <DiaryNewClient />
    </Suspense>
  )
}
