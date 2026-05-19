import { supabase, Award, checkQueryLimit, getQueryRemaining } from '../../app'

Page({
  data: {
    searchKeyword: '',
    quickFilters: [
      { name: '国家级', filter: 'level=国家级' },
      { name: '省级', filter: 'level=省级' },
      { name: '市级', filter: 'level=市级' },
      { name: '2024年', filter: 'year=2024' },
      { name: '2023年', filter: 'year=2023' },
    ],
    stats: {
      total: 0,
      organizations: 0,
      awards: 0
    },
    hotAwards: [] as Award[],
    latestAwards: [] as Award[],
    remainingQueries: 100
  },

  onLoad() {
    this.loadStats()
    this.loadHotAwards()
    this.loadLatestAwards()
    this.setData({ remainingQueries: getQueryRemaining() })
  },

  onSearchInput(e: { detail: { value: string } }) {
    this.setData({ searchKeyword: e.detail.value })
  },

  onSearch() {
    if (!checkQueryLimit()) {
      wx.showToast({ title: '查询次数已达上限', icon: 'none' })
      return
    }
    const keyword = this.data.searchKeyword.trim()
    if (keyword) {
      wx.navigateTo({
        url: `/pages/search/search?keyword=${encodeURIComponent(keyword)}`
      })
    }
    this.setData({ remainingQueries: getQueryRemaining() })
  },

  onQuickFilter(e: { currentTarget: { dataset: { filter: string } } }) {
    if (!checkQueryLimit()) {
      wx.showToast({ title: '查询次数已达上限', icon: 'none' })
      return
    }
    const filter = e.currentTarget.dataset.filter
    wx.navigateTo({
      url: `/pages/search/search?filter=${encodeURIComponent(filter)}`
    })
    this.setData({ remainingQueries: getQueryRemaining() })
  },

  goToSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goToDetail(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async loadStats() {
    try {
      const totalRes = await supabase.from('awards').select('id', { count: 'exact', head: true })
      const orgRes = await supabase.from('awards').select('organization', { count: 'exact', head: true }).distinct()
      const awardRes = await supabase.from('awards').select('award_name', { count: 'exact', head: true }).distinct()
      
      this.setData({
        stats: {
          total: totalRes.count || 0,
          organizations: orgRes.count || 0,
          awards: awardRes.count || 0
        }
      })
    } catch (error) {
      console.error('Load stats failed:', error)
    }
  },

  async loadHotAwards() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('year', { ascending: false })
        .limit(5)
      
      if (error) throw error
      
      const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6']
      const result = data.map((item: Award, index: number) => ({
        ...item,
        color: colors[index % colors.length]
      }))
      
      this.setData({ hotAwards: result })
    } catch (error) {
      console.error('Load hot awards failed:', error)
    }
  },

  async loadLatestAwards() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5)
      
      if (error) throw error
      this.setData({ latestAwards: data })
    } catch (error) {
      console.error('Load latest awards failed:', error)
    }
  }
})