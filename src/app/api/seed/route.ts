import { NextResponse } from 'next/server'
import { MOUNTAINS_DATA } from '@/data/mountains'

export async function POST() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key || url.includes('placeholder')) {
      return NextResponse.json({ error: 'Supabase 환경변수를 설정해주세요' }, { status: 400 })
    }
    const supabase = createClient(url, key)
    const { error } = await supabase
      .from('mountains')
      .upsert(MOUNTAINS_DATA.map((m) => ({ ...m })), { onConflict: 'number' })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true, count: MOUNTAINS_DATA.length })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
