import { supabase, Award } from '../../app'

const app = getApp()

Page({
  data: {
    keyword: '',
    awards: [] as Award[],
    showModal: false,
    editingAward: null as Award | null,
    formData: {
      name: '',
      award_name: '',
      category: '',
      level: '',
      year: '',
      session: '',
      recipients: '',
      organization: '',
      department: '',
      description: ''
    },
    levels: ['国家级', '省级', '市级', '校级'],
    levelIndex: 0
  },

  onLoad() {
    this.loadAwards()
    this.checkAdmin()
  },

  checkAdmin() {
    const user = app.globalData.user
    if (!user || !user.is_admin) {
      wx.showToast({ title: '无管理员权限', icon: 'none' })
      setTimeout(() => {
        wx.switchTab({ url: '/pages/index/index' })
      }, 1500)
    }
  },

  onSearchInput(e: { detail: { value: string } }) {
    this.setData({ keyword: e.detail.value })
  },

  onSearch() {
    this.loadAwards()
  },

  async loadAwards() {
    try {
      let query = supabase.from('awards').select('*')
      
      if (this.data.keyword) {
        const keyword = this.data.keyword
        query = query.or(`name.ilike.%${keyword}%,award_name.ilike.%${keyword}%,recipients.ilike.%${keyword}%,organization.ilike.%${keyword}%`)
      }
      
      const { data, error } = await query.order('year', { ascending: false })
      
      if (error) throw error
      this.setData({ awards: data })
    } catch (error) {
      console.error('Load awards failed:', error)
    }
  },

  importData() {
    wx.showToast({ title: '请选择文件', icon: 'none' })
    wx.chooseFile({
      count: 1,
      type: 'file',
      success: (res) => {
        this.processImportFile(res.tempFiles[0])
      },
      fail: () => {
        wx.showToast({ title: '选择文件失败', icon: 'none' })
      }
    })
  },

  processImportFile(file: { path: string; name: string }) {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'txt') {
      this.parseTxtFile(file.path)
    } else if (ext === 'xlsx' || ext === 'xls') {
      wx.showToast({ title: 'Excel解析开发中', icon: 'none' })
    } else {
      wx.showToast({ title: '不支持的文件格式', icon: 'none' })
    }
  },

  parseTxtFile(filePath: string) {
    wx.showLoading({ title: '解析中...' })
    wx.getFileSystemManager().readFile({
      filePath,
      encoding: 'utf-8',
      success: (res) => {
        const lines = res.data.split('\n')
        const data: Award[] = []
        lines.forEach((line: string) => {
          const parts = line.split('\t')
          if (parts.length >= 6) {
            data.push({
              id: 0,
              name: parts[0] || '',
              award_name: parts[1] || '',
              category: parts[2] || '',
              level: parts[3] || '',
              year: parseInt(parts[4]) || 0,
              session: parseInt(parts[5]) || 0,
              recipients: parts[6] || '',
              organization: parts[7] || '',
              department: parts[8] || '',
              description: parts[9] || '',
              created_at: '',
              updated_at: ''
            })
          }
        })
        this.batchInsert(data)
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({ title: '读取文件失败', icon: 'none' })
      }
    })
  },

  async batchInsert(data: Award[]) {
    try {
      for (const item of data) {
        await supabase.from('awards').insert({
          name: item.name,
          award_name: item.award_name,
          category: item.category,
          level: item.level,
          year: item.year,
          session: item.session,
          recipients: item.recipients,
          organization: item.organization,
          department: item.department,
          description: item.description
        })
      }
      wx.hideLoading()
      wx.showToast({ title: '导入成功', icon: 'success' })
      this.loadAwards()
    } catch (error) {
      wx.hideLoading()
      console.error('Batch insert failed:', error)
      wx.showToast({ title: '导入失败', icon: 'none' })
    }
  },

  addAward() {
    this.setData({
      showModal: true,
      editingAward: null,
      formData: {
        name: '',
        award_name: '',
        category: '',
        level: '',
        year: '',
        session: '',
        recipients: '',
        organization: '',
        department: '',
        description: ''
      },
      levelIndex: 0
    })
  },

  editAward(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    const award = this.data.awards.find(a => a.id === id)
    if (award) {
      this.setData({
        showModal: true,
        editingAward: award,
        formData: {
          name: award.name,
          award_name: award.award_name,
          category: award.category || '',
          level: award.level,
          year: String(award.year),
          session: award.session ? String(award.session) : '',
          recipients: award.recipients,
          organization: award.organization,
          department: award.department || '',
          description: award.description || ''
        },
        levelIndex: this.data.levels.indexOf(award.level)
      })
    }
  },

  viewDetail(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: `/pages/detail/detail?id=${id}` })
  },

  async deleteAward(e: { currentTarget: { dataset: { id: number } } }) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条获奖信息吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const { error } = await supabase.from('awards').delete().eq('id', id)
            if (error) throw error
            wx.showToast({ title: '删除成功', icon: 'success' })
            this.loadAwards()
          } catch (error) {
            console.error('Delete failed:', error)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  },

  closeModal() {
    this.setData({ showModal: false })
  },

  stopPropagation() {},

  onFormInput(e: { detail: { value: string }; currentTarget: { dataset: { field: string } } }) {
    const field = e.currentTarget.dataset.field
    this.setData({
      [`formData.${field}`]: e.detail.value
    })
  },

  onLevelChange(e: { detail: { value: number } }) {
    const index = e.detail.value
    this.setData({
      levelIndex: index,
      'formData.level': this.data.levels[index]
    })
  },

  async submitForm() {
    const { formData } = this.data
    
    if (!formData.name || !formData.award_name || !formData.level || !formData.year || !formData.recipients || !formData.organization) {
      wx.showToast({ title: '请填写必填项', icon: 'none' })
      return
    }

    try {
      if (this.data.editingAward) {
        await supabase.from('awards').update({
          ...formData,
          year: parseInt(formData.year),
          session: formData.session ? parseInt(formData.session) : null,
          updated_at: new Date().toISOString()
        }).eq('id', this.data.editingAward.id)
        wx.showToast({ title: '更新成功', icon: 'success' })
      } else {
        await supabase.from('awards').insert({
          ...formData,
          year: parseInt(formData.year),
          session: formData.session ? parseInt(formData.session) : null
        })
        wx.showToast({ title: '添加成功', icon: 'success' })
      }
      this.closeModal()
      this.loadAwards()
    } catch (error) {
      console.error('Submit failed:', error)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
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