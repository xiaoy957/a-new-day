import { supabase, Award, checkQueryLimit, getQueryRemaining } from '../../app'

Page({
  data: {
    keyword: '',
    selectedLevel: '',
    selectedYear: '',
    levels: [
      { name: '国家级' },
      { name: '省级' },
      { name: '市级' },
      { name: '校级' }
    ],
    years: [],
    results: [] as Award[],
    total: 0,
    page: 1,
    size: 10,
    loading: false,
    hasMore: true
  },

  onLoad(options: { keyword?: string; filter?: string }) {
    if (options?.keyword) {
      this.setData({ keyword: decodeURIComponent(options.keyword) })
    }
    this.loadYears()
    this.onSearch()
  },

  onSearchInput(e: { detail: { value: string } }) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    if (!checkQueryLimit()) {
      wx.showToast({ title: '查询次数已达上限', icon: 'none' })
      return
    }
    this.setData({ 
      page: 1, 
      results: [], 
      hasMore: true,
      total: 0 
    })
    this.loadResults()
  },

  selectLevel(e: { currentTarget: { dataset: { level: string } } }) {
    const level = e.currentTarget.dataset.level
    this.setData({ selectedLevel: level, page: 1, results: [], hasMore: true })
    this.loadResults()
  },

  selectYear(e: { currentTarget: { dataset: { year: string } } }) {
    const year = e.currentTarget.dataset.year
    this.setData({ selectedYear: year, page: 1, results: [], hasMore: true })
    this.loadResults()
  },

  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return
    this.setData({ page: this.data.page + 1 })
    this.loadResults()
  },

  async loadYears() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('year', { count: 'exact', head: false })
        .distinct()
        .order('year', { ascending: false })
      
      if (error) throw error
      const years = data.map((item: { year: number }) => ({ name: `${item.year}年` }))
      this.setData({ years })
    } catch (error) {
      console.error('Load years failed:', error)
    }
  },

  async loadResults() {
    this.setData({ loading: true })
    try {
      let query = supabase.from('awards').select('*', { count: 'exact' })
      
      if (this.data.keyword) {
        const keyword = this.data.keyword
        query = query.or(`name.ilike.%${keyword}%,award_name.ilike.%${keyword}%,recipients.ilike.%${keyword}%,organization.ilike.%${keyword}%`)
      }
      
      if (this.data.selectedLevel) {
        query = query.eq('level', this.data.selectedLevel)
      }
      
      if (this.data.selectedYear) {
        const year = parseInt(this.data.selectedYear.replace('年', ''))
        query = query.eq('year', year)
      }
      
      const { data, error, count } = await query
        .order('year', { ascending: false })
        .range((this.data.page - 1) * this.data.size, this.data.page * this.data.size - 1)
      
      if (error) throw error
      
      const newResults = this.data.page === 1 ? data : [...this.data.results, ...data]
      const hasMore = newResults.length < (count || 0)
      
      this.setData({
        results: newResults,
        total: count || 0,
        loading: false,
        hasMore
      })
    } catch (error) {
      console.error('Load results failed:', error)
      this.setData({ loading: false })
    }
  },

  goToDetail(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
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