export const dynamic = 'force-dynamic'
import { Suspense } from 'react'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default function HomePage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardClient />
    </Suspense>
  )
}

function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-44 bg-[#EDE0C4] rounded-2xl mb-6" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#EDE0C4] rounded-xl" />)}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-64 bg-[#EDE0C4] rounded-xl" />
        <div className="h-64 bg-[#EDE0C4] rounded-xl" />
      </div>
    </div>
  )
}
