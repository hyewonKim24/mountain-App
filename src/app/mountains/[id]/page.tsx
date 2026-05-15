export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import MountainDetailClient from '@/components/mountains/MountainDetailClient'

export default async function MountainDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>}>
      <MountainDetailClient id={id} />
    </Suspense>
  )
}
