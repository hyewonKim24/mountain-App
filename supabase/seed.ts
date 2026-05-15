// Supabase에 100대 명산 초기 데이터를 삽입하는 스크립트
// 실행: npx ts-node supabase/seed.ts
import { createClient } from '@supabase/supabase-js'
import { MOUNTAINS_DATA } from '../src/data/mountains'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

async function seed() {
  console.log('🌱 100대 명산 데이터 삽입 시작...')
  const { data, error } = await supabase.from('mountains').upsert(
    MOUNTAINS_DATA.map((m) => ({ ...m })),
    { onConflict: 'number' }
  )
  if (error) {
    console.error('❌ 오류:', error.message)
    process.exit(1)
  }
  console.log('✅ 완료! 100개 명산 데이터 삽입됨')
}

seed()
