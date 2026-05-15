'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { getMountains, getVisitedMountainIds, getHomeLocation } from '@/lib/queries'
import { Mountain, Region } from '@/types'
import { Filter, X } from 'lucide-react'
import Link from 'next/link'
import { calcDrive } from '@/lib/distance'

declare global {
  interface Window { kakao: any }
}

const REGIONS: Region[] = ['서울', '경기', '강원', '충청', '전라', '경상', '제주']
const REGION_COLORS: Record<Region, string> = {
  서울: '#4CAF50', 경기: '#8BC34A', 강원: '#2196F3', 충청: '#FF9800',
  전라: '#9C27B0', 경상: '#F44336', 제주: '#00BCD4',
}

export default function MapClient() {
  const mapRef = useRef<HTMLDivElement>(null)
  const kakaoMap = useRef<any>(null)
  const markers = useRef<any[]>([])
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [visitedIds, setVisitedIds] = useState<string[]>([])
  const [home, setHome] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selected, setSelected] = useState<Mountain | null>(null)
  const [filterRegion, setFilterRegion] = useState<Region | 'all'>('all')
  const [showFilter, setShowFilter] = useState(false)
  const [mapReady, setMapReady] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([getMountains(), getVisitedMountainIds(), getHomeLocation()]).then(([m, ids, h]) => {
      setMountains(m)
      setVisitedIds(ids)
      if (h) setHome({ latitude: h.latitude, longitude: h.longitude })
    })
  }, [])

  // 카카오맵 초기화
  useEffect(() => {
    let attempts = 0
    const initMap = () => {
      if (!mapRef.current) { if (++attempts < 30) setTimeout(initMap, 200); return }
      if (!window.kakao || !window.kakao.maps) {
        if (++attempts < 30) setTimeout(initMap, 200)
        else setMapError('카카오맵을 불러오지 못했어요.')
        return
      }
      try {
        const map = new window.kakao.maps.Map(mapRef.current, {
          center: new window.kakao.maps.LatLng(36.5, 127.8),
          level: 8,
        })
        kakaoMap.current = map
        setMapReady(true)
      } catch (e) {
        setMapError('지도 초기화 실패: ' + String(e))
      }
    }
    setTimeout(initMap, 100)
  }, [])

  const renderMarkers = useCallback(() => {
    if (!kakaoMap.current || !window.kakao?.maps) return
    markers.current.forEach((m) => m.setMap(null))
    markers.current = []

    const filtered = filterRegion === 'all' ? mountains : mountains.filter((m) => m.region === filterRegion)

    filtered.forEach((mountain) => {
      const isVisited = visitedIds.includes(mountain.id)
      const pos = new window.kakao.maps.LatLng(mountain.latitude, mountain.longitude)

      // 마커 이미지
      const svg = isVisited
        ? `<svg xmlns='http://www.w3.org/2000/svg' width='22' height='22'><circle cx='11' cy='11' r='9' fill='%233D6B4F' stroke='white' stroke-width='2.5'/></svg>`
        : `<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14'><circle cx='7' cy='7' r='5.5' fill='%239ca3af' stroke='white' stroke-width='1.5'/></svg>`

      const size = isVisited ? 22 : 14
      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml,${svg}`,
        new window.kakao.maps.Size(size, size)
      )
      const marker = new window.kakao.maps.Marker({ position: pos, image: markerImage, title: mountain.name })
      marker.setMap(kakaoMap.current)
      markers.current.push(marker)

      // 항상 표시되는 이름 레이블
      const labelColor = isVisited ? '#2A4E38' : '#6B7280'
      const labelBg   = isVisited ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.80)'
      const labelBorder = isVisited ? '#6B9E7B' : '#D1D5DB'
      const labelContent = `
        <div style="
          position:relative;
          margin-top:2px;
          background:${labelBg};
          color:${labelColor};
          font-size:10px;
          font-weight:${isVisited ? '700' : '500'};
          font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;
          padding:2px 5px;
          border-radius:4px;
          border:1px solid ${labelBorder};
          white-space:nowrap;
          box-shadow:0 1px 3px rgba(0,0,0,0.12);
          cursor:pointer;
          pointer-events:auto;
        ">${mountain.name}</div>
      `
      const label = new window.kakao.maps.CustomOverlay({
        position: pos,
        content: labelContent,
        yAnchor: -0.3,   // 마커 아래에 배치
        xAnchor: 0.5,
        zIndex: isVisited ? 4 : 3,
      })
      label.setMap(kakaoMap.current)
      markers.current.push(label)

      // 마커 & 레이블 클릭 이벤트
      const onClick = () => {
        setSelected(mountain)
        kakaoMap.current.panTo(pos)
      }
      window.kakao.maps.event.addListener(marker, 'click', onClick)

      // 레이블 DOM 클릭
      setTimeout(() => {
        const el = label.getContent()
        if (typeof el !== 'string') {
          el.addEventListener?.('click', onClick)
        }
      }, 100)
    })
  }, [mountains, visitedIds, filterRegion])

  useEffect(() => {
    if (mapReady && mountains.length > 0) renderMarkers()
  }, [mapReady, mountains, visitedIds, filterRegion, renderMarkers])

  // 선택된 산의 거리 계산
  const selectedDrive = selected && home
    ? calcDrive(home.latitude, home.longitude, selected.latitude, selected.longitude)
    : null

  if (mapError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-[#F5EDD6] gap-4 p-8 text-center" style={{ height: 'calc(100vh - 56px)' }}>
        <span className="text-5xl">🗺️</span>
        <p className="text-[#8B6F47] font-medium">{mapError}</p>
        <div className="bg-white rounded-xl p-4 text-sm text-left text-[#5C3D1E] max-w-md">
          <p className="font-bold mb-2">해결 방법:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li><a href="https://developers.kakao.com" target="_blank" className="text-blue-600 underline">Kakao Developers</a> 접속</li>
            <li>앱 선택 → 제품 설정 → 카카오맵 → 활성화 ON</li>
            <li>앱 설정 → 플랫폼 → Web → <code className="bg-gray-100 px-1 rounded">http://localhost:3000</code> 추가</li>
            <li>페이지 새로고침</li>
          </ol>
        </div>
      </div>
    )
  }

  return (
    <div className="relative" style={{ height: 'calc(100vh - 56px)' }}>
      {/* 지도 */}
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* 로딩 */}
      {!mapReady && (
        <div className="absolute inset-0 bg-[#F5EDD6] flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-4xl mb-3 animate-bounce">🏔️</div>
            <p className="text-[#8B6F47] text-sm">지도를 불러오는 중...</p>
          </div>
        </div>
      )}

      {/* 필터 */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <button
          onClick={() => setShowFilter(!showFilter)}
          className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg shadow-md text-sm font-medium text-[#2A4E38] border border-[#EDE0C4]"
        >
          <Filter size={14} />
          {filterRegion === 'all' ? '전체 지역' : filterRegion}
        </button>
        {filterRegion !== 'all' && (
          <button onClick={() => setFilterRegion('all')} className="bg-white p-2 rounded-lg shadow-md border border-[#EDE0C4]">
            <X size={14} className="text-[#8B6F47]" />
          </button>
        )}
      </div>

      {/* 지역 드롭다운 */}
      {showFilter && (
        <div className="absolute top-14 left-3 z-20 bg-white rounded-xl shadow-lg border border-[#EDE0C4] p-2 w-36">
          {REGIONS.map((r) => (
            <button key={r} onClick={() => { setFilterRegion(r); setShowFilter(false) }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${filterRegion === r ? 'bg-[#F5EDD6] font-medium' : 'hover:bg-[#F5EDD6]'}`}>
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: REGION_COLORS[r] }} />
              {r}
            </button>
          ))}
        </div>
      )}

      {/* 범례 */}
      <div className="absolute bottom-6 left-3 z-10 bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-[#EDE0C4] p-3 text-xs space-y-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#3D6B4F] border-2 border-white shadow-sm inline-block" />
          방문 완료
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 border border-white inline-block" />
          미방문
        </div>
        {mountains.length > 0 && (
          <div className="text-[#8B6F47] pt-1 border-t border-[#EDE0C4]">
            {visitedIds.length}/{mountains.length} 완료
          </div>
        )}
      </div>

      {/* 선택된 산 팝업 */}
      {selected && (
        <div className="absolute bottom-6 right-3 left-3 md:left-auto md:w-76 z-10">
          <div className="bg-white rounded-xl shadow-xl border border-[#EDE0C4] p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-[#8B6F47]">#{selected.number}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full text-white"
                    style={{ background: REGION_COLORS[selected.region] }}>
                    {selected.region}
                  </span>
                  {visitedIds.includes(selected.id) && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#3D6B4F] text-white">완료 ✓</span>
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#2A4E38] leading-tight">{selected.name}</h3>
                <p className="text-sm text-[#8B6F47]">{selected.altitude}m · 난이도 {selected.difficulty}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600 p-0.5 flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* 집에서 거리 */}
            {selectedDrive && (
              <div className="flex items-center gap-2 bg-[#F5EDD6] rounded-lg px-3 py-2 mb-3">
                <span className="text-base">🚗</span>
                <div>
                  <span className="text-sm font-bold text-[#2A4E38]">약 {selectedDrive.timeStr}</span>
                  <span className="text-xs text-[#8B6F47] ml-1.5">({selectedDrive.km}km · 80km/h 기준)</span>
                </div>
              </div>
            )}

            <p className="text-sm text-[#5C3D1E] mb-3 line-clamp-2">{selected.description}</p>

            <div className="flex gap-2">
              <Link href={`/mountains/${selected.id}`}
                className="flex-1 bg-[#3D6B4F] text-white text-center py-2 rounded-lg text-sm font-medium hover:bg-[#2A4E38] transition-colors">
                상세 보기
              </Link>
              {!visitedIds.includes(selected.id) && (
                <Link href={`/diary/new?mountainId=${selected.id}`}
                  className="flex-1 border border-[#3D6B4F] text-[#3D6B4F] text-center py-2 rounded-lg text-sm font-medium hover:bg-[#F5EDD6] transition-colors">
                  기록하기
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
