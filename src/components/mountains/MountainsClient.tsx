'use client'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getMountains, getVisitedMountainIds, getHomeLocation } from '@/lib/queries'
import { Mountain, Region, Difficulty } from '@/types'
import { Search, CheckCircle2, Circle, Filter } from 'lucide-react'
import { calcDrive } from '@/lib/distance'

const REGIONS: Region[] = ['서울', '경기', '강원', '충청', '전라', '경상', '제주']
const DIFFS: Difficulty[] = ['하', '중', '상']
const DIFF_COLOR: Record<Difficulty, string> = {
  하: 'bg-green-100 text-green-700',
  중: 'bg-yellow-100 text-yellow-700',
  상: 'bg-red-100 text-red-700',
}
const REGION_COLOR: Record<string, string> = {
  서울: 'bg-green-500', 경기: 'bg-lime-500', 강원: 'bg-blue-500',
  충청: 'bg-orange-500', 전라: 'bg-purple-500', 경상: 'bg-red-500', 제주: 'bg-cyan-500',
}

export default function MountainsClient() {
  const searchParams = useSearchParams()
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [visitedIds, setVisitedIds] = useState<string[]>([])
  const [home, setHome] = useState<{ latitude: number; longitude: number } | null>(null)
  const [query, setQuery] = useState('')
  const [regionFilter, setRegionFilter] = useState<Region | 'all'>('all')
  const [diffFilter, setDiffFilter] = useState<Difficulty | 'all'>('all')
  const [showVisited, setShowVisited] = useState<'all' | 'visited' | 'unvisited'>('all')
  const [showFilter, setShowFilter] = useState(false)

  useEffect(() => {
    const f = searchParams.get('filter')
    if (f === 'visited') setShowVisited('visited')
    Promise.all([getMountains(), getVisitedMountainIds(), getHomeLocation()]).then(([m, ids, h]) => {
      setMountains(m)
      setVisitedIds(ids)
      if (h) setHome({ latitude: h.latitude, longitude: h.longitude })
    })
  }, [searchParams])

  const filtered = mountains.filter((m) => {
    if (query && !m.name.includes(query) && !m.province.includes(query)) return false
    if (regionFilter !== 'all' && m.region !== regionFilter) return false
    if (diffFilter !== 'all' && m.difficulty !== diffFilter) return false
    if (showVisited === 'visited' && !visitedIds.includes(m.id)) return false
    if (showVisited === 'unvisited' && visitedIds.includes(m.id)) return false
    return true
  })

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-[#2A4E38]">100대 명산 도감</h1>
          <p className="text-sm text-[#8B6F47]">{visitedIds.length}/100 달성</p>
        </div>
        <button
          onClick={() => setShowFilter(!showFilter)}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-colors ${showFilter ? 'bg-[#3D6B4F] text-white border-[#3D6B4F]' : 'bg-white text-[#3D6B4F] border-[#EDE0C4]'}`}
        >
          <Filter size={14} /> 필터
        </button>
      </div>

      {/* 검색창 */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8B6F47]" />
        <input
          type="text"
          placeholder="산 이름, 지역으로 검색..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-[#EDE0C4] bg-white text-sm focus:outline-none focus:border-[#6B9E7B] placeholder-[#C4A882]"
        />
      </div>

      {/* 필터 패널 */}
      {showFilter && (
        <div className="bg-white rounded-xl p-4 border border-[#EDE0C4] mb-4 space-y-3">
          <div>
            <p className="text-xs font-medium text-[#8B6F47] mb-2">지역</p>
            <div className="flex flex-wrap gap-2">
              <FilterBtn active={regionFilter === 'all'} onClick={() => setRegionFilter('all')}>전체</FilterBtn>
              {REGIONS.map((r) => (
                <FilterBtn key={r} active={regionFilter === r} onClick={() => setRegionFilter(r)}>{r}</FilterBtn>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8B6F47] mb-2">난이도</p>
            <div className="flex gap-2">
              <FilterBtn active={diffFilter === 'all'} onClick={() => setDiffFilter('all')}>전체</FilterBtn>
              {DIFFS.map((d) => (
                <FilterBtn key={d} active={diffFilter === d} onClick={() => setDiffFilter(d)}>{d}</FilterBtn>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-[#8B6F47] mb-2">방문 여부</p>
            <div className="flex gap-2">
              {([['all', '전체'], ['visited', '완료'], ['unvisited', '미완료']] as const).map(([val, label]) => (
                <FilterBtn key={val} active={showVisited === val} onClick={() => setShowVisited(val)}>{label}</FilterBtn>
              ))}
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-[#8B6F47] mb-3">{filtered.length}개의 산</p>

      {/* 명산 그리드 */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {filtered.map((mountain) => {
          const visited = visitedIds.includes(mountain.id)
          const drive = home ? calcDrive(home.latitude, home.longitude, mountain.latitude, mountain.longitude) : null

          return (
            <Link key={mountain.id} href={`/mountains/${mountain.id}`}>
              <div className={`relative rounded-xl p-3 border transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer h-full ${
                visited ? 'bg-white border-[#6B9E7B]' : 'bg-white border-[#EDE0C4]'
              }`}>
                {/* 완료 아이콘 */}
                {visited
                  ? <CheckCircle2 size={15} className="absolute top-2 right-2 text-[#3D6B4F]" />
                  : <Circle size={15} className="absolute top-2 right-2 text-gray-300" />
                }

                {/* 번호 + 지역 */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-xs text-[#8B6F47] font-mono">#{mountain.number}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full text-white ${REGION_COLOR[mountain.region]}`}>
                    {mountain.region}
                  </span>
                </div>

                {/* 산 이름 */}
                <h3 className={`font-bold text-sm mb-0.5 leading-tight ${visited ? 'text-[#2A4E38]' : 'text-[#5C3D1E]'}`}>
                  {mountain.name}
                </h3>

                {/* 고도 */}
                <p className="text-xs text-[#8B6F47] mb-2">{mountain.altitude.toLocaleString()}m</p>

                {/* 집에서 거리 */}
                {drive && (
                  <div className="flex items-center gap-1 mb-1.5 bg-[#F5EDD6] rounded-lg px-2 py-1">
                    <span className="text-[10px]">🚗</span>
                    <span className="text-[10px] font-medium text-[#3D6B4F]">{drive.timeStr}</span>
                    <span className="text-[10px] text-[#8B6F47]">({drive.km}km)</span>
                  </div>
                )}

                {/* 난이도 + 아이콘 */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${DIFF_COLOR[mountain.difficulty]}`}>
                    {mountain.difficulty}
                  </span>
                  {mountain.is_sunrise_spot && <span className="text-[10px]">🌅</span>}
                  {mountain.is_autumn_spot && <span className="text-[10px]">🍁</span>}
                  {mountain.has_cable_car && <span className="text-[10px]">🚡</span>}
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-[#8B6F47]">
          <span className="text-4xl mb-3">🏔️</span>
          <p>검색 결과가 없어요</p>
        </div>
      )}
    </div>
  )
}

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
        active ? 'bg-[#3D6B4F] text-white border-[#3D6B4F]' : 'border-[#EDE0C4] text-[#8B6F47] hover:border-[#6B9E7B]'
      }`}
    >
      {children}
    </button>
  )
}
