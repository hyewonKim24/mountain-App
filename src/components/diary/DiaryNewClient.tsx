'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { getMountains, createVisit, uploadPhoto, createPhoto } from '@/lib/queries'
import { Mountain, Weather } from '@/types'
import { ArrowLeft, Upload, Star, X } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

const WEATHERS: Weather[] = ['맑음', '흐림', '비', '눈', '안개']
const WEATHER_EMOJI: Record<Weather, string> = { 맑음: '☀️', 흐림: '☁️', 비: '🌧️', 눈: '❄️', 안개: '🌫️' }
const COUPLE_TAGS = [
  '욱태 체력 이슈 발생 🚨', '혜원 만족도 ⭐⭐⭐⭐⭐', '오늘의 베스트 사진 📸',
  '정상 도착 🎉', '하산 실패 😅', '날씨 최고 ☀️', '경치 감동 🏔️', '맛있는 거 먹었다 🍱',
  '다리 후들후들 🦵', '여기 또 오고 싶다 💚', '힘든데 뿌듯 💪', '케이블카 이용 🚡',
]

export default function DiaryNewClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const presetMountainId = searchParams.get('mountainId')

  const [mountains, setMountains] = useState<Mountain[]>([])
  const [form, setForm] = useState({
    mountain_id: presetMountainId || '',
    visit_date: new Date().toISOString().slice(0, 10),
    weather: '맑음' as Weather,
    duration_minutes: 180,
    short_review: '',
    difficulty_rating: 3,
    want_revisit: true,
    tags: [] as string[],
    is_favorite: false,
  })
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    getMountains().then(setMountains)
  }, [])

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    onDrop: (accepted) => {
      setFiles((prev) => [...prev, ...accepted])
      accepted.forEach((f) => {
        const reader = new FileReader()
        reader.onload = (e) => setPreviews((prev) => [...prev, e.target?.result as string])
        reader.readAsDataURL(f)
      })
    },
  })

  const toggleTag = (tag: string) => {
    setForm((f) => ({
      ...f,
      tags: f.tags.includes(tag) ? f.tags.filter((t) => t !== tag) : [...f.tags, tag],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.mountain_id) { alert('산을 선택해주세요'); return }
    setSaving(true)
    try {
      const visit = await createVisit(form)
      // 사진 업로드
      for (const file of files) {
        try {
          const url = await uploadPhoto(file, form.mountain_id, visit.id)
          await createPhoto({ mountain_id: form.mountain_id, visit_id: visit.id, url, caption: '', is_representative: false })
        } catch { /* 사진 실패는 무시 */ }
      }
      router.push('/diary')
    } catch (err) {
      alert('저장 중 오류가 발생했어요. Supabase 설정을 확인해주세요.')
    } finally {
      setSaving(false)
    }
  }

  const hours = Math.floor(form.duration_minutes / 60)
  const mins = form.duration_minutes % 60

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24">
      <Link href="/diary" className="flex items-center gap-1 text-[#8B6F47] text-sm mb-4 hover:text-[#3D6B4F]">
        <ArrowLeft size={16} /> 등산 일기로
      </Link>
      <h1 className="text-xl font-bold text-[#2A4E38] mb-6">등산 기록 추가 📝</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 산 선택 */}
        <Section title="어느 산을 다녀왔나요? *">
          <select
            required
            value={form.mountain_id}
            onChange={(e) => setForm({ ...form, mountain_id: e.target.value })}
            className="w-full border border-[#EDE0C4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6B9E7B] bg-white"
          >
            <option value="">산을 선택하세요</option>
            {mountains.map((m) => (
              <option key={m.id} value={m.id}>#{m.number} {m.name} ({m.altitude}m, {m.region})</option>
            ))}
          </select>
        </Section>

        {/* 날짜 + 날씨 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Section title="방문 날짜">
            <input
              type="date"
              value={form.visit_date}
              onChange={(e) => setForm({ ...form, visit_date: e.target.value })}
              className="w-full border border-[#EDE0C4] rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-[#6B9E7B]"
            />
          </Section>
          <Section title="날씨">
            <div className="flex gap-1.5 flex-wrap">
              {WEATHERS.map((w) => (
                <button type="button" key={w}
                  onClick={() => setForm({ ...form, weather: w })}
                  className={`flex-1 min-w-0 py-2 rounded-xl text-sm transition-colors ${form.weather === w ? 'bg-[#3D6B4F] text-white' : 'bg-[#F5EDD6] text-[#8B6F47] hover:bg-[#EDE0C4]'}`}>
                  {WEATHER_EMOJI[w]}
                </button>
              ))}
            </div>
          </Section>
        </div>

        {/* 소요 시간 */}
        <Section title={`등산 소요 시간: ${hours}시간 ${mins}분`}>
          <input
            type="range" min={30} max={720} step={15}
            value={form.duration_minutes}
            onChange={(e) => setForm({ ...form, duration_minutes: Number(e.target.value) })}
            className="w-full accent-[#3D6B4F]"
          />
          <div className="flex justify-between text-xs text-[#8B6F47] mt-1">
            <span>30분</span><span>6시간</span><span>12시간</span>
          </div>
        </Section>

        {/* 체감 난이도 */}
        <Section title="체감 난이도 (힘들었던 정도)">
          <div className="flex gap-2">
            {[['1', '😊', '쉬움'], ['2', '😐', '보통'], ['3', '😅', '힘듦'], ['4', '😰', '매우힘듦'], ['5', '💀', '지옥']].map(([val, emoji, label]) => (
              <button type="button" key={val}
                onClick={() => setForm({ ...form, difficulty_rating: Number(val) })}
                className={`flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-xs transition-colors ${form.difficulty_rating === Number(val) ? 'bg-[#3D6B4F] text-white' : 'bg-[#F5EDD6] text-[#8B6F47] hover:bg-[#EDE0C4]'}`}>
                <span className="text-lg">{emoji}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* 한줄 후기 */}
        <Section title="한줄 후기">
          <textarea
            placeholder="오늘 등산 어떠셨나요? 솔직한 후기를 남겨보세요 😊"
            value={form.short_review}
            onChange={(e) => setForm({ ...form, short_review: e.target.value })}
            rows={3}
            className="w-full border border-[#EDE0C4] rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#6B9E7B] resize-none"
          />
        </Section>

        {/* 커플 스탬프 태그 */}
        <Section title="오늘의 스탬프 🎉">
          <div className="flex flex-wrap gap-2">
            {COUPLE_TAGS.map((tag) => (
              <button type="button" key={tag}
                onClick={() => toggleTag(tag)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  form.tags.includes(tag) ? 'bg-[#3D6B4F] text-white border-[#3D6B4F]' : 'border-[#EDE0C4] text-[#8B6F47] hover:border-[#6B9E7B]'
                }`}>
                {tag}
              </button>
            ))}
          </div>
        </Section>

        {/* 옵션 토글 */}
        <Section title="추가 옵션">
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.want_revisit} onChange={(e) => setForm({ ...form, want_revisit: e.target.checked })}
                className="accent-[#3D6B4F] w-4 h-4" />
              <span className="text-sm text-[#5C3D1E]">재방문 희망 💚</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_favorite} onChange={(e) => setForm({ ...form, is_favorite: e.target.checked })}
                className="accent-[#D4A843] w-4 h-4" />
              <span className="text-sm text-[#5C3D1E]">최애 산 ⭐</span>
            </label>
          </div>
        </Section>

        {/* 사진 업로드 */}
        <Section title="사진 업로드 📸">
          <div {...getRootProps()} className="border-2 border-dashed border-[#C4A882] rounded-xl p-6 text-center cursor-pointer hover:border-[#6B9E7B] hover:bg-[#F5EDD6] transition-colors">
            <input {...getInputProps()} />
            <Upload size={24} className="mx-auto text-[#8B6F47] mb-2" />
            <p className="text-sm text-[#8B6F47]">사진을 드래그하거나 클릭해서 업로드</p>
            <p className="text-xs text-[#C4A882] mt-1">여러 장 선택 가능</p>
          </div>
          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-lg" />
                  <button type="button" onClick={() => {
                    setFiles((f) => f.filter((_, j) => j !== i))
                    setPreviews((p) => p.filter((_, j) => j !== i))
                  }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* 저장 버튼 */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#EDE0C4] px-4 py-3">
          <button
            type="submit"
            disabled={saving}
            className="w-full max-w-2xl mx-auto block bg-[#3D6B4F] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#2A4E38] disabled:opacity-50 transition-colors"
          >
            {saving ? '저장 중...' : '등산 기록 저장하기 🏔️'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-[#EDE0C4] p-4">
      <h3 className="text-sm font-bold text-[#2A4E38] mb-3">{title}</h3>
      {children}
    </div>
  )
}
