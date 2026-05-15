export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import BadgesClient from '@/components/badges/BadgesClient'

export default function BadgesPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>}>
      <BadgesClient />
    </Suspense>
  )
}
