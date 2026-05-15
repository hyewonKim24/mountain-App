'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getVisits, deleteVisit } from '@/lib/queries'
import { Visit } from '@/types'
import { Plus, Star, Trash2, ChevronRight, Pencil } from 'lucide-react'

const WEATHER_EMOJI: Record<string, string> = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 안개: '🌫️' }

export default function DiaryClient() {
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    getVisits().then((v) => { setVisits(v); setLoading(false) }).catch(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('이 기록을 삭제할까요?')) return
    await deleteVisit(id)
    load()
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-[#8B6F47]">로딩 중...</div>

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#2A4E38]">등산 일기</h1>
          <p className="text-sm text-[#8B6F47]">총 {visits.length}번의 등산 기록</p>
        </div>
        <Link href="/diary/new"
          className="flex items-center gap-2 bg-[#3D6B4F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#2A4E38] transition-colors">
          <Plus size={16} /> 기록 추가
        </Link>
      </div>

      {visits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-5xl mb-4">📓</span>
          <h2 className="text-lg font-bold text-[#2A4E38] mb-2">아직 등산 기록이 없어요</h2>
          <p className="text-sm text-[#8B6F47] mb-6">첫 등산 기록을 남겨보세요!</p>
          <Link href="/diary/new" className="bg-[#3D6B4F] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#2A4E38] transition-colors">
            첫 기록 작성하기
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {visits.map((visit) => (
            <div key={visit.id} className="bg-white rounded-2xl border border-[#EDE0C4] p-5 shadow-sm fade-in">
              {/* 상단: 날짜 + 산 이름 */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm text-[#8B6F47]">{visit.visit_date}</span>
                    <span className="text-base">{WEATHER_EMOJI[visit.weather] || '🌤️'}</span>
                    {visit.is_favorite && <Star size={14} className="text-[#D4A843] fill-[#D4A843]" />}
                  </div>
                  <Link href={`/mountains/${visit.mountain_id}`} className="flex items-center gap-1 hover:underline">
                    <h3 className="text-lg font-bold text-[#2A4E38]">
                      {(visit.mountain as any)?.name || '산 이름'}
                    </h3>
                    <ChevronRight size={16} className="text-[#6B9E7B]" />
                  </Link>
                </div>
                <div className="flex gap-1">
                  <Link href={`/diary/edit/${visit.id}`} className="p-2 text-[#8B6F47] hover:text-[#3D6B4F] hover:bg-[#F5EDD6] rounded-lg transition-colors">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => handleDelete(visit.id)} className="p-2 text-[#8B6F47] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* 통계 */}
              <div className="flex items-center gap-3 text-xs text-[#8B6F47] mb-3">
                <span>⏱️ {Math.floor(visit.duration_minutes / 60)}시간 {visit.duration_minutes % 60}분</span>
                <span>·</span>
                <span>체감난이도: {['😊', '😐', '😅', '😰', '💀'][visit.difficulty_rating - 1] || '😐'}</span>
                {visit.want_revisit && <><span>·</span><span className="text-[#3D6B4F]">재방문 희망 ✓</span></>}
              </div>

              {/* 한줄 후기 */}
              {visit.short_review && (
                <p className="text-sm text-[#5C3D1E] bg-[#F5EDD6] rounded-lg p-3 mb-3 italic">
                  &quot;{visit.short_review}&quot;
                </p>
              )}

              {/* 태그 */}
              {visit.tags && visit.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {visit.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-[#E8F5E9] text-[#2E7D32] px-2.5 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
