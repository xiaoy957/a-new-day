export interface Award {
  id: number
  name: string
  award_name: string
  category?: string
  level?: string
  year?: number
  session?: number
  recipients?: string
  organization?: string
  department?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface User {
  id: number
  username: string
  nickname?: string
  is_admin: boolean
  created_at?: string
}

export interface Favorite {
  id: number
  user_id: number
  award_id: number
  created_at?: string
}

export interface Stats {
  total: number
  national: number
  provincial: number
  municipal: number
  school: number
  organizations: number
  awardTypes: number
}

export type Level = '国家级' | '省级' | '市级' | '校级'

export const LEVEL_COLORS: Record<string, string> = {
  '国家级': 'bg-red-500',
  '省级': 'bg-orange-500',
  '市级': 'bg-yellow-500',
  '校级': 'bg-green-500'
}

export const LEVEL_TEXT_COLORS: Record<string, string> = {
  '国家级': 'text-red-500',
  '省级': 'text-orange-500',
  '市级': 'text-yellow-500',
  '校级': 'text-green-500'
}