export type Region = '서울' | '경기' | '강원' | '충청' | '전라' | '경상' | '제주'
export type Difficulty = '하' | '중' | '상'
export type Season = '봄' | '여름' | '가을' | '겨울'
export type Weather = '맑음' | '흐림' | '비' | '눈' | '안개'

export interface Mountain {
  id: string
  number: number
  name: string
  region: Region
  province: string
  altitude: number
  difficulty: Difficulty
  recommended_course: string
  estimated_time: string
  latitude: number
  longitude: number
  has_parking: boolean
  has_cable_car: boolean
  has_restroom: boolean
  is_sunrise_spot: boolean
  is_autumn_spot: boolean
  description: string
  trailhead_address: string
  created_at: string
}

export interface Visit {
  id: string
  mountain_id: string
  mountain?: Mountain
  visit_date: string
  weather: Weather
  duration_minutes: number
  short_review: string
  difficulty_rating: number
  want_revisit: boolean
  tags: string[]
  is_favorite: boolean
  photos?: Photo[]
  created_at: string
}

export interface Photo {
  id: string
  mountain_id: string
  visit_id: string
  url: string
  caption: string
  is_representative: boolean
  created_at: string
}

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  condition_type: 'count' | 'region' | 'special'
  condition_value: number | string
  condition_region?: Region
  earned?: boolean
  earned_at?: string
}

export interface HomeLocation {
  id: string
  name: string
  latitude: number
  longitude: number
}

export interface DashboardStats {
  total_visited: number
  total_mountains: number
  percentage: number
  by_region: Record<Region, { visited: number; total: number }>
  monthly_counts: { month: string; count: number }[]
  total_duration_minutes: number
  most_visited_region: Region | null
  favorite_mountains: Mountain[]
}
