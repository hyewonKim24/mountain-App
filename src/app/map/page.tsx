export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import MapClient from '@/components/map/MapClient'

export default function MapPage() {
  return (
    <div style={{ height: 'calc(100vh - 56px)', position: 'relative' }}>
      <Suspense fallback={
        <div className="flex items-center justify-center h-full bg-[#F5EDD6]">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">🏔️</div>
            <p className="text-[#8B6F47] text-sm">지도를 불러오는 중...</p>
          </div>
        </div>
      }>
        <MapClient />
      </Suspense>
    </div>
  )
}
