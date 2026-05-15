import { supabase } from './supabase'
import type { Mountain, Visit, Photo } from '@/types'

export async function getMountains(): Promise<Mountain[]> {
  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .order('number')
  if (error) throw error
  return data
}

export async function getMountain(id: string): Promise<Mountain | null> {
  const { data, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('id', id)
    .single()
  if (error) return null
  return data
}

export async function getVisits(): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*, mountain:mountains(*), photos(*)')
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function getVisitsByMountain(mountainId: string): Promise<Visit[]> {
  const { data, error } = await supabase
    .from('visits')
    .select('*, photos(*)')
    .eq('mountain_id', mountainId)
    .order('visit_date', { ascending: false })
  if (error) throw error
  return data
}

export async function createVisit(visit: Omit<Visit, 'id' | 'created_at' | 'mountain' | 'photos'>) {
  const { data, error } = await supabase.from('visits').insert(visit).select().single()
  if (error) throw error
  return data
}

export async function updateVisit(id: string, updates: Partial<Visit>) {
  const { error } = await supabase.from('visits').update(updates).eq('id', id)
  if (error) throw error
}

export async function deleteVisit(id: string) {
  const { error } = await supabase.from('visits').delete().eq('id', id)
  if (error) throw error
}

export async function getPhotos(): Promise<Photo[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function uploadPhoto(file: File, mountainId: string, visitId: string): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `${mountainId}/${visitId}/${Date.now()}.${ext}`
  const { error: upErr } = await supabase.storage.from('mountain-photos').upload(path, file)
  if (upErr) throw upErr

  const { data } = supabase.storage.from('mountain-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function createPhoto(photo: Omit<Photo, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('photos').insert(photo).select().single()
  if (error) throw error
  return data
}

export async function setRepresentativePhoto(photoId: string, mountainId: string) {
  await supabase.from('photos').update({ is_representative: false }).eq('mountain_id', mountainId)
  const { error } = await supabase.from('photos').update({ is_representative: true }).eq('id', photoId)
  if (error) throw error
}

export async function getHomeLocation() {
  const { data } = await supabase.from('home_location').select('*').single()
  return data
}

export async function updateHomeLocation(lat: number, lng: number) {
  const { data: existing } = await supabase.from('home_location').select('id').single()
  if (existing) {
    await supabase.from('home_location').update({ latitude: lat, longitude: lng, updated_at: new Date().toISOString() }).eq('id', existing.id)
  } else {
    await supabase.from('home_location').insert({ latitude: lat, longitude: lng })
  }
}

export async function getVisitedMountainIds(): Promise<string[]> {
  const { data } = await supabase.from('visits').select('mountain_id')
  return [...new Set((data || []).map((v) => v.mountain_id))]
}

export async function getDashboardStats() {
  const [visitedIds, visits] = await Promise.all([
    getVisitedMountainIds(),
    getVisits(),
  ])

  const monthly: Record<string, number> = {}
  let totalMinutes = 0

  visits.forEach((v) => {
    const month = v.visit_date.slice(0, 7)
    monthly[month] = (monthly[month] || 0) + 1
    totalMinutes += v.duration_minutes || 0
  })

  const monthlyArr = Object.entries(monthly)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-12)
    .map(([month, count]) => ({ month, count }))

  return {
    total_visited: visitedIds.length,
    total_mountains: 100,
    percentage: visitedIds.length,
    total_duration_minutes: totalMinutes,
    monthly_counts: monthlyArr,
    visited_ids: visitedIds,
  }
}
