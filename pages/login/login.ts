import { supabase } from '../../app'

const app = getApp()

Page({
  data: {
    username: '',
    password: ''
  },

  onUsernameInput(e: { detail: { value: string } }) {
    this.setData({ username: e.detail.value })
  },

  onPasswordInput(e: { detail: { value: string } }) {
    this.setData({ password: e.detail.value })
  },

  async onLogin() {
    const { username, password } = this.data
    
    if (!username || !password) {
      wx.showToast({ title: '请填写用户名和密码', icon: 'none' })
      return
    }

    wx.showLoading({ title: '登录中...' })
    
    try {
      const { user, error } = await supabase.auth.signInWithPassword({
        email: username,
        password
      })
      
      if (error) throw error
      
      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('openid', user.id)
          .single()
        
        const userData = {
          id: user.id,
          openid: user.id,
          nickname: user.user_metadata?.name || username,
          avatar_url: user.user_metadata?.avatar_url || '',
          is_admin: profile?.is_admin || false,
          created_at: user.created_at || ''
        }
        
        app.globalData.user = userData
        wx.setStorageSync('user', JSON.stringify(userData))
        
        wx.hideLoading()
        wx.showToast({ title: '登录成功', icon: 'success' })
        
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' })
        }, 1500)
      }
    } catch (error) {
      wx.hideLoading()
      console.error('Login failed:', error)
      wx.showToast({ title: '登录失败', icon: 'none' })
    }
  },

  goToRegister() {
    wx.showToast({ title: '注册功能开发中', icon: 'none' })
  },

  forgotPassword() {
    wx.showToast({ title: '找回密码功能开发中', icon: 'none' })
  },

  async wechatLogin() {
    wx.showLoading({ title: '微信授权中...' })
    
    try {
      const res = await wx.login()
      if (res.code) {
        const { user, error } = await supabase.auth.signInWithOAuth({
          provider: 'wechat',
          options: {
            redirectTo: `${supabase.url}/auth/v1/callback`
          }
        })
        
        if (error) throw error
        
        if (user) {
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('openid', user.id)
            .single()
          
          if (!profile) {
            await supabase.from('users').insert({
              openid: user.id,
              nickname: user.user_metadata?.name || '用户',
              avatar_url: user.user_metadata?.avatar_url || '',
              is_admin: false
            })
          }
          
          const userData = {
            id: user.id,
            openid: user.id,
            nickname: user.user_metadata?.name || '用户',
            avatar_url: user.user_metadata?.avatar_url || '',
            is_admin: profile?.is_admin || false,
            created_at: user.created_at || ''
          }
          
          app.globalData.user = userData
          wx.setStorageSync('user', JSON.stringify(userData))
          
          wx.hideLoading()
          wx.showToast({ title: '登录成功', icon: 'success' })
          
          setTimeout(() => {
            wx.switchTab({ url: '/pages/index/index' })
          }, 1500)
        }
      }
    } catch (error) {
      wx.hideLoading()
      console.error('WeChat login failed:', error)
      wx.showToast({ title: '微信登录失败', icon: 'none' })
    }
  }
})