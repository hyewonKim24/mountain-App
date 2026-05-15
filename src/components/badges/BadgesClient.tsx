'use client'
import { useEffect, useState } from 'react'
import { getMountains, getVisitedMountainIds, getVisits } from '@/lib/queries'
import { Mountain, Visit } from '@/types'

interface BadgeDef {
  id: string
  icon: string
  name: string
  description: string
  condition: (visited: Mountain[], visits: Visit[]) => boolean
  hint: string
}

const BADGE_DEFS: BadgeDef[] = [
  { id: 'first', icon: '🥾', name: '첫 발걸음', description: '첫 번째 명산 완등!', condition: (v) => v.length >= 1, hint: '첫 번째 산을 등산하면 획득' },
  { id: 'ten', icon: '🏅', name: '10개 달성', description: '10개의 명산을 완등했어요!', condition: (v) => v.length >= 10, hint: '10개의 산을 등산하면 획득' },
  { id: 'twenty', icon: '🥈', name: '20개 달성', description: '20개 완등! 절반을 향해!', condition: (v) => v.length >= 20, hint: '20개의 산을 등산하면 획득' },
  { id: 'fifty', icon: '🏆', name: '절반 달성', description: '50개 완등! 중간 지점!', condition: (v) => v.length >= 50, hint: '50개의 산을 등산하면 획득' },
  { id: 'hundred', icon: '🌟', name: '100대 명산 완등', description: '전설이 됐다! 100개 모두 완등!', condition: (v) => v.length >= 100, hint: '100개를 모두 등산하면 획득' },
  { id: 'hallasan', icon: '🏔️', name: '한라산 정복', description: '대한민국 최고봉 한라산!', condition: (v) => v.some((m) => m.name.includes('한라산')), hint: '한라산 등산 후 획득' },
  { id: 'jirisan', icon: '⛰️', name: '지리산 종주', description: '우리나라 최초의 국립공원!', condition: (v) => v.some((m) => m.name.includes('지리산') && m.province.includes('경상')), hint: '지리산(천왕봉) 등산 후 획득' },
  { id: 'seorak', icon: '🦅', name: '설악산 대청봉', description: '설악산 최고봉 대청봉!', condition: (v) => v.some((m) => m.name.includes('설악산')), hint: '설악산(대청봉) 등산 후 획득' },
  { id: 'jeju', icon: '🌺', name: '제주 탐험가', description: '제주도의 명산을 올랐어요!', condition: (v) => v.some((m) => m.region === '제주'), hint: '제주 지역 산 등산 후 획득' },
  { id: 'gangwon', icon: '🌊', name: '강원도 마스터', description: '강원도 명산 10개 완등!', condition: (v) => v.filter((m) => m.region === '강원').length >= 10, hint: '강원도 산 10개 등산 후 획득' },
  { id: 'gyeonggi', icon: '🌳', name: '경기도 탐험가', description: '경기도 명산 5개 완등!', condition: (v) => v.filter((m) => m.region === '경기').length >= 5, hint: '경기도 산 5개 등산 후 획득' },
  { id: 'seoul', icon: '🏙️', name: '서울 도심 산악인', description: '서울 명산을 모두 완등!', condition: (v) => v.filter((m) => m.region === '서울').length >= 3, hint: '서울 지역 산 3개 등산 후 획득' },
  { id: 'hard', icon: '💀', name: '지옥의 계단 생존자', description: '난이도 上 산을 5개 완등!', condition: (v) => v.filter((m) => m.difficulty === '상').length >= 5, hint: '난이도 上 산 5개 등산 후 획득' },
  { id: 'sunrise', icon: '🌅', name: '일출 마스터', description: '일출 명소 산을 완등했어요!', condition: (v) => v.some((m) => m.is_sunrise_spot), hint: '일출 명소 산 등산 후 획득' },
  { id: 'autumn', icon: '🍁', name: '단풍 마스터', description: '단풍 명소 명산 5개 완등!', condition: (v) => v.filter((m) => m.is_autumn_spot).length >= 5, hint: '단풍 명소 산 5개 등산 후 획득' },
  { id: 'cable', icon: '🚡', name: '케이블카 탑승자', description: '케이블카가 있는 산을 올랐어요!', condition: (v) => v.some((m) => m.has_cable_car), hint: '케이블카 있는 산 등산 후 획득' },
  { id: 'hiker', icon: '⏱️', name: '장거리 등산가', description: '총 등산 시간이 100시간!', condition: (_, vis) => vis.reduce((s, v) => s + (v.duration_minutes || 0), 0) >= 6000, hint: '누적 등산 시간 100시간 달성 후 획득' },
  { id: 'island', icon: '🏝️', name: '섬 탐험가', description: '울릉도나 섬의 산을 올랐어요!', condition: (v) => v.some((m) => m.name === '성인봉' || m.name === '깃대봉'), hint: '성인봉 또는 깃대봉 등산 후 획득' },
]

export default function BadgesClient() {
  const [visitedMountains, setVisitedMountains] = useState<Mountain[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getMountains(), getVisitedMountainIds(), getVisits()]).then(([mountains, ids, vis]) => {
      setVisitedMountains(mountains.filter((m) => ids.includes(m.id)))
      setVisits(vis)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>

  const earned = BADGE_DEFS.filter((b) => b.condition(visitedMountains, visits))
  const unearned = BADGE_DEFS.filter((b) => !b.condition(visitedMountains, visits))

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-[#2A4E38]">배지함 🏅</h1>
        <p className="text-sm text-[#8B6F47]">{earned.length}/{BADGE_DEFS.length} 달성</p>
      </div>

      {/* 달성 배지 */}
      {earned.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-bold text-[#3D6B4F] mb-3 uppercase tracking-wide">획득한 배지 ✨</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {earned.map((badge) => (
              <div key={badge.id} className="bg-white border-2 border-[#6B9E7B] rounded-2xl p-4 text-center shadow-sm fade-in">
                <div className="text-4xl mb-2">{badge.icon}</div>
                <h3 className="font-bold text-[#2A4E38] text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[#6B9E7B]">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 미달성 배지 */}
      {unearned.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-[#8B6F47] mb-3 uppercase tracking-wide">도전 중인 배지</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {unearned.map((badge) => (
              <div key={badge.id} className="bg-white border border-[#EDE0C4] rounded-2xl p-4 text-center opacity-50">
                <div className="text-4xl mb-2 grayscale">{badge.icon}</div>
                <h3 className="font-bold text-[#8B6F47] text-sm mb-1">{badge.name}</h3>
                <p className="text-xs text-[#C4A882]">{badge.hint}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {earned.length === 0 && (
        <div className="text-center py-16 text-[#8B6F47]">
          <span className="text-5xl mb-4 block">🎯</span>
          <p className="text-base font-medium">아직 획득한 배지가 없어요</p>
          <p className="text-sm mt-1">첫 산을 등산하면 배지를 받을 수 있어요!</p>
        </div>
      )}
    </div>
  )
}
