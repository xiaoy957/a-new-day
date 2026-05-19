import { SupabaseClient, createClient } from '@supabase/supabase-js'
import { encryptStorage, decryptStorage, removeStorage } from './utils/crypto'

const SUPABASE_URL = 'https://your-project.supabase.co'
const SUPABASE_KEY = 'your-anon-key'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

export interface Award {
  id: number
  name: string
  award_name: string
  category: string
  level: string
  year: number
  session: number
  recipients: string
  organization: string
  department: string
  description: string
  created_at: string
  updated_at: string
}

export interface User {
  id: string
  openid: string
  nickname: string
  avatar_url: string
  is_admin: boolean
  created_at: string
}

export interface Favorite {
  id: number
  user_id: string
  award_id: number
  created_at: string
}

export interface TrendData {
  year: number
  count: number
}

const QUERY_LIMIT = 100
const QUERY_WINDOW = 3600000

let queryCount = 0
let queryWindowStart = Date.now()

export function checkQueryLimit(): boolean {
  const now = Date.now()
  if (now - queryWindowStart > QUERY_WINDOW) {
    queryCount = 0
    queryWindowStart = now
  }
  if (queryCount >= QUERY_LIMIT) {
    return false
  }
  queryCount++
  return true
}

export function getQueryRemaining(): number {
  const now = Date.now()
  if (now - queryWindowStart > QUERY_WINDOW) {
    return QUERY_LIMIT
  }
  return QUERY_LIMIT - queryCount
}

App({
  globalData: {
    user: null as User | null,
    favorites: [] as number[],
    queryCount: 0
  },

  async onLaunch() {
    const userInfo = decryptStorage('user')
    if (userInfo) {
      this.globalData.user = userInfo
    }
    
    const favorites = decryptStorage('favorites')
    if (favorites) {
      this.globalData.favorites = favorites
    }
  },

  async login() {
    try {
      const res = await wx.login()
      const { user, error } = await supabase.auth.signInWithOAuth({
        provider: 'wechat',
        options: {
          redirectTo: `${SUPABASE_URL}/auth/v1/callback`
        }
      })
      if (error) throw error
      if (user) {
        const userData = user as unknown as User
        this.globalData.user = userData
        encryptStorage('user', userData)
      }
      return user
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  async logout() {
    await supabase.auth.signOut()
    this.globalData.user = null
    this.globalData.favorites = []
    removeStorage('user')
    removeStorage('favorites')
  },

  addFavorite(awardId: number) {
    if (!this.globalData.favorites.includes(awardId)) {
      this.globalData.favorites.push(awardId)
      encryptStorage('favorites', this.globalData.favorites)
    }
  },

  removeFavorite(awardId: number) {
    this.globalData.favorites = this.globalData.favorites.filter(id => id !== awardId)
    encryptStorage('favorites', this.globalData.favorites)
  },

  isFavorite(awardId: number): boolean {
    return this.globalData.favorites.includes(awardId)
  }
})