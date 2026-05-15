'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getDashboardStats, getMountains } from '@/lib/queries'
import { Mountain } from '@/types'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { MapPin, Clock, Mountain as MountainIcon, Star, ChevronRight, TrendingUp } from 'lucide-react'

const REGION_COLORS: Record<string, string> = {
  서울: '#4CAF50', 경기: '#8BC34A', 강원: '#2196F3', 충청: '#FF9800',
  전라: '#9C27B0', 경상: '#F44336', 제주: '#00BCD4',
}

export default function DashboardClient() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof getDashboardStats>> | null>(null)
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [visitedIds, setVisitedIds] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getMountains()]).then(([s, m]) => {
      setStats(s)
      setMountains(m)
      setVisitedIds(s.visited_ids)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  if (loading) return <DashSkeleton />

  const visited = stats?.total_visited ?? 0
  const pct = Math.round((visited / 100) * 100)
  const circumference = 2 * Math.PI * 54
  const dashOffset = circumference - (circumference * pct) / 100

  const regionStats = (['강원', '경상', '전라', '충청', '경기', '서울', '제주'] as const).map((r) => {
    const total = mountains.filter((m) => m.region === r).length
    const done = mountains.filter((m) => m.region === r && visitedIds.includes(m.id)).length
    return { region: r, total, done }
  })

  const recentMountains = mountains
    .filter((m) => visitedIds.includes(m.id))
    .slice(0, 4)

  const totalHours = Math.round((stats?.total_duration_minutes ?? 0) / 60)

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 fade-in">
      {/* 히어로 배너 */}
      <div
        className="relative rounded-2xl overflow-hidden p-6 md:p-10"
        style={{ background: 'linear-gradient(135deg, #2A4E38 0%, #3D6B4F 50%, #6B9E7B 100%)' }}
      >
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 5L5 55h50L30 5z\' fill=\'white\' fill-opacity=\'0.5\'/%3E%3C/svg%3E")',
          backgroundSize: '80px',
        }} />
        <div className="relative flex flex-col md:flex-row items-center gap-8">
          {/* 원형 진행률 */}
          <div className="flex-shrink-0">
            <svg width="140" height="140" viewBox="0 0 140 140">
              <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="12" />
              <circle
                cx="70" cy="70" r="54"
                fill="none"
                stroke="#C4A882"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                transform="rotate(-90 70 70)"
                style={{ transition: 'stroke-dashoffset 1.5s ease' }}
              />
              <text x="70" y="65" textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">{visited}</text>
              <text x="70" y="85" textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="13">/100</text>
            </svg>
          </div>
          <div className="text-white text-center md:text-left">
            <p className="text-[#C4A882] text-sm font-medium mb-1">혜원이와 욱태의</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">100대 명산 도전기 🏔️</h1>
            <p className="text-white/80 text-base mb-4">
              {pct}% 달성 · 아직 <span className="text-[#C4A882] font-bold">{100 - visited}개</span> 남았어요!
            </p>
            <div className="flex gap-3 justify-center md:justify-start">
              <Link href="/mountains" className="bg-[#C4A882] text-[#2A4E38] px-4 py-2 rounded-lg text-sm font-bold hover:bg-[#D4B892] transition-colors">
                명산 도감 보기
              </Link>
              <Link href="/diary/new" className="border border-white/40 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
                기록 추가 +
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 통계 카드 4개 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: <MountainIcon size={20} />, label: '완료한 산', value: `${visited}개`, sub: '/ 100개', color: 'bg-[#3D6B4F]' },
          { icon: <Clock size={20} />, label: '총 등산 시간', value: `${totalHours}h`, sub: `${stats?.total_duration_minutes ?? 0}분`, color: 'bg-[#8B6F47]' },
          { icon: <TrendingUp size={20} />, label: '이번 달', value: `${stats?.monthly_counts?.slice(-1)[0]?.count ?? 0}회`, sub: '등산 횟수', color: 'bg-[#5C7A3E]' },
          { icon: <Star size={20} />, label: '달성률', value: `${pct}%`, sub: '100대 명산', color: 'bg-[#7A5C2E]' },
        ].map((card, i) => (
          <div key={i} className={`${card.color} text-white rounded-xl p-4 flex flex-col gap-2`}>
            <div className="opacity-80">{card.icon}</div>
            <div className="text-2xl font-bold">{card.value}</div>
            <div className="text-xs opacity-70">{card.label}</div>
          </div>
        ))}
      </div>

      {/* 지역별 달성률 + 월별 그래프 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 지역별 달성률 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#EDE0C4]">
          <h2 className="font-bold text-[#2A4E38] mb-4 flex items-center gap-2">
            <MapPin size={16} className="text-[#6B9E7B]" /> 지역별 달성률
          </h2>
          <div className="space-y-3">
            {regionStats.map(({ region, total, done }) => (
              <div key={region}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-[#2C1810]">{region}</span>
                  <span className="text-[#8B6F47]">{done}/{total}</span>
                </div>
                <div className="w-full bg-[#F5EDD6] rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-700"
                    style={{
                      width: `${total > 0 ? (done / total) * 100 : 0}%`,
                      backgroundColor: REGION_COLORS[region],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 월별 등산 횟수 */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#EDE0C4]">
          <h2 className="font-bold text-[#2A4E38] mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#6B9E7B]" /> 월별 등산 횟수
          </h2>
          {stats?.monthly_counts && stats.monthly_counts.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={stats.monthly_counts} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#8B6F47' }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#8B6F47' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: '#F5EDD6', border: '1px solid #C4A882', borderRadius: 8, fontSize: 12 }}
                  formatter={(v) => [`${v}회`, '등산']}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {stats.monthly_counts.map((_, i) => (
                    <Cell key={i} fill={i === stats.monthly_counts.length - 1 ? '#3D6B4F' : '#6B9E7B'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-44 text-[#8B6F47] text-sm">
              아직 등산 기록이 없어요 🥾
            </div>
          )}
        </div>
      </div>

      {/* 최근 방문한 산 */}
      {recentMountains.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-[#EDE0C4]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-[#2A4E38] flex items-center gap-2">
              <Star size={16} className="text-[#D4A843]" /> 완료한 명산
            </h2>
            <Link href="/mountains?filter=visited" className="text-[#6B9E7B] text-sm flex items-center gap-1 hover:underline">
              전체 보기 <ChevronRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {recentMountains.map((m) => (
              <Link key={m.id} href={`/mountains/${m.id}`} className="block p-3 bg-[#F5EDD6] rounded-lg hover:bg-[#EDE0C4] transition-colors group">
                <div className="flex items-center gap-1 mb-1">
                  <span className="text-xs text-[#8B6F47]">#{m.number}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full text-white text-[10px]"
                    style={{ background: REGION_COLORS[m.region] }}>
                    {m.region}
                  </span>
                </div>
                <div className="font-bold text-[#2A4E38] text-sm group-hover:text-[#3D6B4F]">{m.name}</div>
                <div className="text-xs text-[#8B6F47]">{m.altitude.toLocaleString()}m</div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* 빠른 액세스 */}
      <div className="grid grid-cols-3 gap-3 pb-4">
        {[
          { href: '/map', icon: '🗺️', label: '지도 탐색' },
          { href: '/diary/new', icon: '📝', label: '기록 추가' },
          { href: '/gallery', icon: '📸', label: '사진 보기' },
        ].map((item) => (
          <Link key={item.href} href={item.href}
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-[#EDE0C4] hover:border-[#6B9E7B] hover:shadow-md transition-all">
            <span className="text-2xl">{item.icon}</span>
            <span className="text-xs font-medium text-[#2A4E38]">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

function DashSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse space-y-6">
      <div className="h-44 bg-[#EDE0C4] rounded-2xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-[#EDE0C4] rounded-xl" />)}
      </div>
    </div>
  )
}
