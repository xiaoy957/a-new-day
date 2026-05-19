import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Trophy, User, Lock } from 'lucide-react'
import { useStore } from '../stores/useStore'

export function Login() {
  const navigate = useNavigate()
  const { login } = useStore()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!username || !password) {
      setError('请输入用户名和密码')
      return
    }

    setLoading(true)

    try {
      const users = await window.electronAPI.db.query(
        'SELECT * FROM users WHERE username = ? AND password_hash = ?',
        [username, password]
      )

      if (users.length === 0) {
        setError('用户名或密码错误')
        setLoading(false)
        return
      }

      const user = users[0]
      login({
        id: user.id,
        username: user.username,
        nickname: user.nickname || user.username,
        is_admin: user.is_admin === 1,
        created_at: user.created_at
      })

      navigate('/')
    } catch (err) {
      console.error('Login failed:', err)
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center p-8">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center mb-4">
            <Trophy className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">科研奖励获奖信息查询系统</h1>
          <p className="text-gray-500 mt-2">登录后可使用收藏和管理功能</p>
        </div>

        {/* 登录表单 */}
        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              用户名
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                className="input pl-12"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              密码
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                className="input pl-12"
                placeholder="请输入密码"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 text-lg disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        {/* 提示信息 */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-2">默认账户信息：</p>
          <p className="text-sm text-gray-500">用户名：admin</p>
          <p className="text-sm text-gray-500">密码：admin123</p>
        </div>
      </div>
    </div>
  )
}
