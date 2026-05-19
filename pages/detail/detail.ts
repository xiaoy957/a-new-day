import { supabase, Award } from '../../app'

const app = getApp()

Page({
  data: {
    award: null as Award | null,
    isFavorite: false,
    hasUser: false
  },

  onLoad(options: { id?: string }) {
    const id = options?.id
    if (id) {
      this.loadAward(parseInt(id))
    }
    this.checkUser()
  },

  async loadAward(id: number) {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      this.setData({ award: data })
      this.checkFavorite(data.id)
    } catch (error) {
      console.error('Load award failed:', error)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  checkUser() {
    const user = app.globalData.user
    this.setData({ hasUser: !!user })
  },

  checkFavorite(awardId: number) {
    const isFavorite = app.isFavorite(awardId)
    this.setData({ isFavorite })
  },

  toggleFavorite() {
    if (!this.data.hasUser) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      wx.navigateTo({ url: '/pages/login/login' })
      return
    }

    const awardId = this.data.award?.id
    if (!awardId) return

    if (this.data.isFavorite) {
      app.removeFavorite(awardId)
      this.setData({ isFavorite: false })
      wx.showToast({ title: '已取消收藏', icon: 'success' })
    } else {
      app.addFavorite(awardId)
      this.setData({ isFavorite: true })
      wx.showToast({ title: '收藏成功', icon: 'success' })
    }
  },

  goBack() {
    wx.navigateBack()
  },

  getLevelColor(level: string): string {
    const colors: Record<string, string> = {
      '国家级': '#ef4444',
      '省级': '#f97316',
      '市级': '#eab308',
      '校级': '#22c55e'
    }
    return colors[level] || '#999'
  },

  formatTime(timeStr: string): string {
    if (!timeStr) return ''
    const date = new Date(timeStr)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  }
})