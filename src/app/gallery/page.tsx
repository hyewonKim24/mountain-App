export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import GalleryClient from '@/components/gallery/GalleryClient'

export default function GalleryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64 text-[#8B6F47]">갤러리 로딩 중...</div>}>
      <GalleryClient />
    </Suspense>
  )
}
