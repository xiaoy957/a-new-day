import { create } from 'zustand'
import { Award, User, Stats } from '../types'

interface AppState {
  // 用户状态
  user: User | null
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
  
  // 收藏状态
  favorites: number[]
  addFavorite: (awardId: number) => void
  removeFavorite: (awardId: number) => void
  isFavorite: (awardId: number) => boolean
  
  // 统计数据
  stats: Stats | null
  setStats: (stats: Stats) => void
  
  // 搜索状态
  searchKeyword: string
  setSearchKeyword: (keyword: string) => void
  
  // 当前选中奖项
  currentAward: Award | null
  setCurrentAward: (award: Award | null) => void
  
  // 刷新标记
  refreshTrigger: number
  triggerRefresh: () => void
}

export const useStore = create<AppState>((set, get) => ({
  // 用户状态
  user: null,
  isAuthenticated: false,
  login: (user) => {
    set({ user, isAuthenticated: true })
    localStorage.setItem('user', JSON.stringify(user))
  },
  logout: () => {
    set({ user: null, isAuthenticated: false, favorites: [] })
    localStorage.removeItem('user')
    localStorage.removeItem('favorites')
  },
  
  // 收藏状态
  favorites: JSON.parse(localStorage.getItem('favorites') || '[]'),
  addFavorite: (awardId) => {
    const favorites = [...get().favorites, awardId]
    set({ favorites })
    localStorage.setItem('favorites', JSON.stringify(favorites))
  },
  removeFavorite: (awardId) => {
    const favorites = get().favorites.filter(id => id !== awardId)
    set({ favorites })
    localStorage.setItem('favorites', JSON.stringify(favorites))
  },
  isFavorite: (awardId) => get().favorites.includes(awardId),
  
  // 统计数据
  stats: null,
  setStats: (stats) => set({ stats }),
  
  // 搜索状态
  searchKeyword: '',
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
  
  // 当前选中奖项
  currentAward: null,
  setCurrentAward: (award) => set({ currentAward: award }),
  
  // 刷新标记
  refreshTrigger: 0,
  triggerRefresh: () => set({ refreshTrigger: Date.now() })
}))

// 初始化用户状态
const initUser = () => {
  const userStr = localStorage.getItem('user')
  if (userStr) {
    try {
      const user = JSON.parse(userStr)
      useStore.getState().login(user)
    } catch {
      localStorage.removeItem('user')
    }
  }
}

initUser()