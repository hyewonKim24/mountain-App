'use client'
import { useEffect, useState } from 'react'
import { getPhotos, getMountains, setRepresentativePhoto } from '@/lib/queries'
import { Photo, Mountain, Region } from '@/types'
import { Star, X, ChevronLeft, ChevronRight } from 'lucide-react'

const REGIONS: Region[] = ['강원', '경상', '전라', '충청', '경기', '서울', '제주']

export default function GalleryClient() {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [filter, setFilter] = useState<Region | 'all'>('all')
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPhotos(), getMountains()]).then(([p, m]) => {
      setPhotos(p)
      setMountains(m)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const getMountainRegion = (mountainId: string): Region | undefined => {
    return mountains.find((m) => m.id === mountainId)?.region as Region | undefined
  }

  const filtered = filter === 'all' ? photos : photos.filter((p) => getMountainRegion(p.mountain_id) === filter)

  const handleSetRepresentative = async (photo: Photo) => {
    await setRepresentativePhoto(photo.id, photo.mountain_id)
    setPhotos((prev) => prev.map((p) =>
      p.mountain_id === photo.mountain_id
        ? { ...p, is_representative: p.id === photo.id }
        : p
    ))
  }

  const navigate = (dir: 1 | -1) => {
    if (lightbox === null) return
    const next = lightbox + dir
    if (next >= 0 && next < filtered.length) setLightbox(next)
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8B6F47]">갤러리 로딩 중...</div>

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="mb-5">
        <h1 className="text-xl font-bold text-[#2A4E38]">사진 갤러리 📸</h1>
        <p className="text-sm text-[#8B6F47]">총 {photos.length}장</p>
      </div>

      {/* 지역 필터 */}
      <div className="flex gap-2 flex-wrap mb-5">
        <button onClick={() => setFilter('all')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-[#3D6B4F] text-white' : 'bg-white text-[#8B6F47] border border-[#EDE0C4] hover:border-[#6B9E7B]'}`}>
          전체
        </button>
        {REGIONS.map((r) => (
          <button key={r} onClick={() => setFilter(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === r ? 'bg-[#3D6B4F] text-white' : 'bg-white text-[#8B6F47] border border-[#EDE0C4] hover:border-[#6B9E7B]'}`}>
            {r}
          </button>
        ))}
      </div>

      {/* 그리드 */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-[#8B6F47]">
          <span className="text-5xl mb-4">📷</span>
          <p className="text-sm">사진이 없어요. 등산 기록에서 사진을 추가해보세요!</p>
        </div>
      ) : (
        <div className="columns-2 sm:columns-3 md:columns-4 gap-3 space-y-3">
          {filtered.map((photo, idx) => {
            const mountain = mountains.find((m) => m.id === photo.mountain_id)
            return (
              <div key={photo.id} className="break-inside-avoid relative group">
                <button onClick={() => setLightbox(idx)} className="w-full">
                  <img
                    src={photo.url}
                    alt={mountain?.name || '등산 사진'}
                    className="w-full rounded-xl object-cover hover:opacity-90 transition-opacity"
                  />
                </button>
                {/* 오버레이 */}
                <div className="absolute inset-0 rounded-xl bg-black/0 group-hover:bg-black/20 transition-colors pointer-events-none" />
                {/* 대표 사진 버튼 */}
                <button
                  onClick={() => handleSetRepresentative(photo)}
                  className={`absolute top-2 right-2 p-1.5 rounded-full transition-all ${
                    photo.is_representative
                      ? 'bg-[#D4A843] text-white opacity-100'
                      : 'bg-white/80 text-gray-400 opacity-0 group-hover:opacity-100'
                  }`}
                  title="대표 사진 설정"
                >
                  <Star size={12} className={photo.is_representative ? 'fill-white' : ''} />
                </button>
                {/* 산 이름 */}
                {mountain && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-xs font-medium">{mountain.name}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* 라이트박스 */}
      {lightbox !== null && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightbox(null)}>
          <button onClick={(e) => { e.stopPropagation(); setLightbox(null) }}
            className="absolute top-4 right-4 text-white/80 hover:text-white">
            <X size={28} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); navigate(-1) }}
            className="absolute left-4 text-white/80 hover:text-white disabled:opacity-20"
            disabled={lightbox === 0}>
            <ChevronLeft size={36} />
          </button>
          <img
            src={filtered[lightbox]?.url}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
          <button onClick={(e) => { e.stopPropagation(); navigate(1) }}
            className="absolute right-4 text-white/80 hover:text-white disabled:opacity-20"
            disabled={lightbox === filtered.length - 1}>
            <ChevronRight size={36} />
          </button>
          {/* 캡션 */}
          <div className="absolute bottom-6 left-0 right-0 text-center text-white/70 text-sm">
            {lightbox + 1} / {filtered.length}
            {filtered[lightbox]?.caption && <span className="ml-3">{filtered[lightbox].caption}</span>}
          </div>
        </div>
      )}
    </div>
  )
}
