export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import MountainsClient from '@/components/mountains/MountainsClient'

export default function MountainsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>}>
      <MountainsClient />
    </Suspense>
  )
}
