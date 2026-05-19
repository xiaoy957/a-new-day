import { supabase, Award } from '../../app'

const app = getApp()

Page({
  data: {
    favorites: [] as Award[],
    hasUser: false
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const user = app.globalData.user
    this.setData({ hasUser: !!user })
    
    if (!user) return
    
    const favoriteIds = app.globalData.favorites
    if (favoriteIds.length === 0) {
      this.setData({ favorites: [] })
      return
    }
    
    this.loadFavoriteDetails(favoriteIds)
  },

  async loadFavoriteDetails(ids: number[]) {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .in('id', ids)
      
      if (error) throw error
      
      const sortedData = ids.map(id => data.find((item: Award) => item.id === id)).filter(Boolean)
      this.setData({ favorites: sortedData as Award[] })
    } catch (error) {
      console.error('Load favorites failed:', error)
    }
  },

  goToDetail(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  removeFavorite(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    app.removeFavorite(id)
    wx.showToast({ title: '已取消收藏', icon: 'success' })
    this.loadFavorites()
  },

  stopPropagation() {},

  goToLogin() {
    wx.navigateTo({ url: '/pages/login/login' })
  },

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      '国家级': '#ef4444',
      '省级': '#f97316',
      '市级': '#eab308',
      '校级': '#22c55e'
    }
    return colors[level] || '#999'
  }
})