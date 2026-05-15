'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getMountain, getVisitsByMountain, getHomeLocation } from '@/lib/queries'
import { Mountain, Visit } from '@/types'
import { ArrowLeft, MapPin, Clock, Mountain as MIcon, Navigation, Car, Star, CheckCircle2 } from 'lucide-react'

declare global { interface Window { kakao: any } }

const DIFF_COLOR: Record<string, string> = {
  하: 'bg-green-100 text-green-700',
  중: 'bg-yellow-100 text-yellow-700',
  상: 'bg-red-100 text-red-700',
}

// Haversine 공식으로 두 좌표 사이 직선 거리(km) 계산
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function formatTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `약 ${m}분`
  if (m === 0) return `약 ${h}시간`
  return `약 ${h}시간 ${m}분`
}

export default function MountainDetailClient({ id }: { id: string }) {
  const [mountain, setMountain] = useState<Mountain | null>(null)
  const [visits, setVisits] = useState<Visit[]>([])
  const [distInfo, setDistInfo] = useState<{ straight: string; road: string; time: string; homeName: string } | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    getMountain(id).then((m) => {
      setMountain(m)
      if (m) getVisitsByMountain(m.id).then(setVisits)
    })
  }, [id])

  // 집에서 거리 계산
  useEffect(() => {
    if (!mountain) return
    getHomeLocation().then((home) => {
      if (!home) return
      const straight = haversineKm(home.latitude, home.longitude, mountain.latitude, mountain.longitude)
      // 실제 도로 거리 ≈ 직선 × 1.35 (국내 도로망 평균 계수)
      const road = straight * 1.35
      const timeHours = road / 80 // 평균 80km/h 기준
      setDistInfo({
        straight: straight.toFixed(1),
        road: road.toFixed(0),
        time: formatTime(timeHours),
        homeName: home.name || '우리 집',
      })
    })
  }, [mountain])

  // 미니 지도 초기화
  useEffect(() => {
    if (!mountain || !mapRef.current) return

    let attempts = 0
    const tryMap = () => {
      if (!window.kakao?.maps) {
        if (++attempts < 20) setTimeout(tryMap, 300)
        return
      }
      const pos = new window.kakao.maps.LatLng(mountain.latitude, mountain.longitude)
      const map = new window.kakao.maps.Map(mapRef.current, { center: pos, level: 7 })
      const marker = new window.kakao.maps.Marker({ position: pos, title: mountain.name })
      marker.setMap(map)
      const info = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px;font-size:13px;font-weight:bold;white-space:nowrap">${mountain.name}</div>`,
      })
      info.open(map, marker)
    }
    setTimeout(tryMap, 300)
  }, [mountain])

  if (!mountain) {
    return (
      <div className="flex items-center justify-center h-64 text-[#8B6F47]">
        <div className="text-center">
          <div className="text-3xl mb-2 animate-bounce">🏔️</div>
          <p className="text-sm">로딩 중...</p>
        </div>
      </div>
    )
  }

  const visited = visits.length > 0

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 fade-in">
      <Link href="/mountains" className="flex items-center gap-1 text-[#8B6F47] text-sm mb-4 hover:text-[#3D6B4F]">
        <ArrowLeft size={16} /> 명산 도감으로
      </Link>

      {/* 상단 카드 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE0C4] p-6 mb-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-[#8B6F47]">#{mountain.number}</span>
              {visited && <CheckCircle2 size={18} className="text-[#3D6B4F]" />}
            </div>
            <h1 className="text-2xl font-bold text-[#2A4E38]">{mountain.name}</h1>
            <p className="text-sm text-[#8B6F47] mt-0.5">{mountain.province}</p>
          </div>
          <span className={`text-sm px-3 py-1 rounded-full font-medium ${DIFF_COLOR[mountain.difficulty]}`}>
            난이도 {mountain.difficulty}
          </span>
        </div>

        <p className="text-sm text-[#5C3D1E] mb-5">{mountain.description}</p>

        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <MIcon size={15} />, label: '해발고도', value: `${mountain.altitude.toLocaleString()}m` },
            { icon: <Clock size={15} />, label: '예상 소요', value: mountain.estimated_time },
            { icon: <Navigation size={15} />, label: '추천 코스', value: mountain.recommended_course },
            { icon: <MapPin size={15} />, label: '소재지', value: mountain.region },
          ].map(({ icon, label, value }) => (
            <div key={label} className="flex items-start gap-2 p-3 bg-[#F5EDD6] rounded-lg">
              <span className="text-[#6B9E7B] mt-0.5 flex-shrink-0">{icon}</span>
              <div>
                <p className="text-[10px] text-[#8B6F47] mb-0.5">{label}</p>
                <p className="text-sm font-medium text-[#2A4E38] leading-tight">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 집에서 거리 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE0C4] p-5 mb-4">
        <h2 className="font-bold text-[#2A4E38] mb-4 flex items-center gap-2">
          <Car size={16} className="text-[#6B9E7B]" /> 우리 집에서 거리
          <span className="text-xs text-[#C4A882] font-normal ml-1">({distInfo?.homeName})</span>
        </h2>

        {distInfo ? (
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[#F5EDD6] rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-[#2A4E38]">
                {distInfo.straight}
                <span className="text-xs font-normal ml-0.5">km</span>
              </p>
              <p className="text-xs text-[#8B6F47] mt-0.5">직선 거리</p>
            </div>
            <div className="bg-[#EDE0C4] rounded-xl p-4 text-center">
              <p className="text-xl font-bold text-[#2A4E38]">
                {distInfo.road}
                <span className="text-xs font-normal ml-0.5">km</span>
              </p>
              <p className="text-xs text-[#8B6F47] mt-0.5">예상 도로 거리</p>
            </div>
            <div className="bg-[#3D6B4F] rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-white leading-tight">{distInfo.time}</p>
              <p className="text-xs text-[#C4A882] mt-0.5">자동차 기준</p>
            </div>
          </div>
        ) : (
          <div className="flex gap-3">
            <div className="flex-1 bg-[#F5EDD6] rounded-xl h-16 animate-pulse" />
            <div className="flex-1 bg-[#F5EDD6] rounded-xl h-16 animate-pulse" />
            <div className="flex-1 bg-[#F5EDD6] rounded-xl h-16 animate-pulse" />
          </div>
        )}
        <p className="text-xs text-[#C4A882] mt-2">
          * 직선 거리 기반 추정값 (도로 거리 = 직선 × 1.35, 평균 80km/h 기준)
        </p>
      </div>

      {/* 편의시설 & 특징 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE0C4] p-5 mb-4">
        <h2 className="font-bold text-[#2A4E38] mb-3">편의시설 & 특징</h2>
        <div className="flex flex-wrap gap-2">
          <Tag icon="🅿️" label="주차" active={mountain.has_parking} />
          <Tag icon="🚡" label="케이블카" active={mountain.has_cable_car} />
          <Tag icon="🚻" label="화장실" active={mountain.has_restroom} />
          <Tag icon="🌅" label="일출 명소" active={mountain.is_sunrise_spot} gold />
          <Tag icon="🍁" label="단풍 명소" active={mountain.is_autumn_spot} gold />
        </div>
      </div>

      {/* 미니 지도 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE0C4] overflow-hidden mb-4">
        <div className="p-4 pb-0 flex items-center justify-between">
          <h2 className="font-bold text-[#2A4E38] text-sm">위치</h2>
          <a
            href={`https://map.kakao.com/link/search/${encodeURIComponent(mountain.name)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs text-[#6B9E7B] flex items-center gap-1 hover:underline"
          >
            카카오맵에서 보기 →
          </a>
        </div>
        <div ref={mapRef} style={{ width: '100%', height: '200px' }} />
      </div>

      {/* 방문 기록 */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#EDE0C4] p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#2A4E38]">방문 기록 ({visits.length})</h2>
          <Link
            href={`/diary/new?mountainId=${mountain.id}`}
            className="text-sm bg-[#3D6B4F] text-white px-3 py-1.5 rounded-lg hover:bg-[#2A4E38] transition-colors"
          >
            기록 추가 +
          </Link>
        </div>

        {visits.length === 0 ? (
          <div className="text-center py-8 text-[#8B6F47]">
            <p className="text-3xl mb-2">🥾</p>
            <p className="text-sm">아직 등산 기록이 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {visits.map((v) => (
              <div key={v.id} className="border border-[#EDE0C4] rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#2A4E38]">{v.visit_date}</span>
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={12}
                        className={i < v.difficulty_rating ? 'text-[#D4A843] fill-[#D4A843]' : 'text-gray-200 fill-gray-200'} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 text-xs text-[#8B6F47] mb-2 flex-wrap">
                  <span>{v.weather}</span>
                  <span>·</span>
                  <span>⏱ {Math.floor(v.duration_minutes / 60)}h {v.duration_minutes % 60}m</span>
                  {v.want_revisit && <><span>·</span><span className="text-[#3D6B4F]">재방문 희망 ✓</span></>}
                </div>
                {v.short_review && (
                  <p className="text-sm text-[#5C3D1E] italic">"{v.short_review}"</p>
                )}
                {v.tags && v.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {v.tags.map((tag) => (
                      <span key={tag} className="text-xs bg-[#F5EDD6] text-[#8B6F47] px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 하단 버튼 */}
      <div className="grid grid-cols-2 gap-3 pb-4">
        <a
          href={`https://map.kakao.com/link/search/${encodeURIComponent(mountain.trailhead_address || mountain.name)}`}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#F5EDD6] text-[#2A4E38] text-sm font-medium hover:bg-[#EDE0C4] transition-colors"
        >
          <MapPin size={16} /> 카카오맵 길찾기
        </a>
        <Link
          href={`/diary/new?mountainId=${mountain.id}`}
          className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#3D6B4F] text-white text-sm font-medium hover:bg-[#2A4E38] transition-colors"
        >
          📝 등산 기록하기
        </Link>
      </div>
    </div>
  )
}

function Tag({ icon, label, active, gold }: { icon: string; label: string; active: boolean; gold?: boolean }) {
  if (!active) {
    return (
      <span className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 line-through">
        {icon} {label}
      </span>
    )
  }
  return (
    <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-medium ${gold ? 'bg-[#FFF8E1] text-[#B7860B]' : 'bg-[#E8F5E9] text-[#2E7D32]'}`}>
      {icon} {label}
    </span>
  )
}
