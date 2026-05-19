import { supabase, Award } from '../../app'

interface OverviewData {
  total: number
  national: number
  provincial: number
  municipal: number
  school: number
}

interface TrendItem {
  year: number
  count: number
}

interface PersonResult {
  count: number
  awards: Award[]
}

interface TopItem {
  name: string
  count: number
}

Page({
  data: {
    tabs: [
      { key: 'overview', name: '概览' },
      { key: 'trend', name: '趋势' },
      { key: 'person', name: '个人统计' },
      { key: 'organization', name: '单位统计' }
    ],
    activeTab: 'overview',
    overview: {} as OverviewData,
    awardNames: [],
    selectedAward: '',
    selectedAwardIndex: 0,
    trendData: [] as TrendItem[],
    personKeyword: '',
    personResult: null as PersonResult | null,
    topRecipients: [] as TopItem[],
    orgKeyword: '',
    orgResult: null as { count: number } | null,
    topOrgs: [] as TopItem[],
    maxCount: 0
  },

  onLoad() {
    this.loadOverview()
    this.loadAwardNames()
    this.loadTopRecipients()
    this.loadTopOrgs()
  },

  switchTab(e: { currentTarget: { dataset: { tab: string } } }) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
    if (tab === 'trend') {
      this.loadTrendData()
    }
  },

  async loadOverview() {
    try {
      const totalRes = await supabase.from('awards').select('id', { count: 'exact', head: true })
      const nationalRes = await supabase.from('awards').select('id', { count: 'exact', head: true }).eq('level', '国家级')
      const provincialRes = await supabase.from('awards').select('id', { count: 'exact', head: true }).eq('level', '省级')
      const municipalRes = await supabase.from('awards').select('id', { count: 'exact', head: true }).eq('level', '市级')
      const schoolRes = await supabase.from('awards').select('id', { count: 'exact', head: true }).eq('level', '校级')

      this.setData({
        overview: {
          total: totalRes.count || 0,
          national: nationalRes.count || 0,
          provincial: provincialRes.count || 0,
          municipal: municipalRes.count || 0,
          school: schoolRes.count || 0
        }
      })
    } catch (error) {
      console.error('Load overview failed:', error)
    }
  },

  async loadAwardNames() {
    try {
      const { data, error } = await supabase.from('awards').select('award_name').distinct()
      if (error) throw error
      const names = data.map((item: { award_name: string }) => item.award_name)
      this.setData({ 
        awardNames: names,
        selectedAward: names[0] || ''
      })
    } catch (error) {
      console.error('Load award names failed:', error)
    }
  },

  onAwardChange(e: { detail: { value: number } }) {
    const index = e.detail.value
    this.setData({ 
      selectedAwardIndex: index,
      selectedAward: this.data.awardNames[index]
    })
    this.loadTrendData()
  },

  async loadTrendData() {
    if (!this.data.selectedAward) return
    
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('year')
        .eq('award_name', this.data.selectedAward)
      
      if (error) throw error
      
      const yearMap: Record<number, number> = {}
      data.forEach((item: { year: number }) => {
        yearMap[item.year] = (yearMap[item.year] || 0) + 1
      })
      
      const trendData = Object.entries(yearMap)
        .map(([year, count]) => ({ year: parseInt(year), count }))
        .sort((a, b) => a.year - b.year)
      
      const maxCount = Math.max(...trendData.map(t => t.count), 1)
      
      this.setData({ trendData, maxCount })
    } catch (error) {
      console.error('Load trend data failed:', error)
    }
  },

  onPersonSearchInput(e: { detail: { value: string } }) {
    this.setData({ personKeyword: e.detail.value })
  },

  async searchPerson() {
    const keyword = this.data.personKeyword.trim()
    if (!keyword) return
    
    try {
      const { data, error, count } = await supabase
        .from('awards')
        .select('*', { count: 'exact' })
        .or(`recipients.ilike.%${keyword}%`)
      
      if (error) throw error
      
      this.setData({
        personResult: {
          count: count || 0,
          awards: data
        }
      })
    } catch (error) {
      console.error('Search person failed:', error)
    }
  },

  async loadTopRecipients() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('recipients')
      
      if (error) throw error
      
      const recipientMap: Record<string, number> = {}
      data.forEach((item: { recipients: string }) => {
        const names = item.recipients.split('、').filter(n => n.trim())
        names.forEach(name => {
          recipientMap[name] = (recipientMap[name] || 0) + 1
        })
      })
      
      const topRecipients = Object.entries(recipientMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      this.setData({ topRecipients })
    } catch (error) {
      console.error('Load top recipients failed:', error)
    }
  },

  onOrgSearchInput(e: { detail: { value: string } }) {
    this.setData({ orgKeyword: e.detail.value })
  },

  async searchOrg() {
    const keyword = this.data.orgKeyword.trim()
    if (!keyword) return
    
    try {
      const { count, error } = await supabase
        .from('awards')
        .select('id', { count: 'exact', head: true })
        .or(`organization.ilike.%${keyword}%`)
      
      if (error) throw error
      
      this.setData({
        orgResult: { count: count || 0 }
      })
    } catch (error) {
      console.error('Search org failed:', error)
    }
  },

  async loadTopOrgs() {
    try {
      const { data, error } = await supabase
        .from('awards')
        .select('organization')
      
      if (error) throw error
      
      const orgMap: Record<string, number> = {}
      data.forEach((item: { organization: string }) => {
        if (item.organization) {
          orgMap[item.organization] = (orgMap[item.organization] || 0) + 1
        }
      })
      
      const topOrgs = Object.entries(orgMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      
      this.setData({ topOrgs })
    } catch (error) {
      console.error('Load top orgs failed:', error)
    }
  },

  getBarHeight(count: number): number {
    if (this.data.maxCount === 0) return 0
    return (count / this.data.maxCount) * 100
  },

  get nationalPercent(): number {
    const total = this.data.overview.total || 1
    return (this.data.overview.national / total) * 360
  },

  get provincialPercent(): number {
    const total = this.data.overview.total || 1
    return (this.data.overview.provincial / total) * 360
  },

  get municipalPercent(): number {
    const total = this.data.overview.total || 1
    return (this.data.overview.municipal / total) * 360
  },

  goToDetail(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  }
})