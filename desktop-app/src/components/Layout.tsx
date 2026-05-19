import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { 
  Home, 
  Search, 
  BarChart3, 
  Star, 
  Settings, 
  LogOut,
  Trophy
} from 'lucide-react'
import { useStore } from '../stores/useStore'

const navItems = [
  { path: '/', label: '首页', icon: Home },
  { path: '/search', label: '搜索', icon: Search },
  { path: '/statistics', label: '统计', icon: BarChart3 },
  { path: '/favorites', label: '收藏', icon: Star },
  { path: '/admin', label: '管理', icon: Settings },
]

export function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 侧边导航栏 */}
      <aside className="w-64 bg-white shadow-lg flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900">科研奖励</h1>
              <p className="text-xs text-gray-500">获奖信息查询系统</p>
            </div>
          </div>
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path || 
              (item.path !== '/' && location.pathname.startsWith(item.path))
            
            return (
              <div
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            )
          })}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t">
          {user ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 font-medium">
                    {user.nickname?.[0] || user.username[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{user.nickname || user.username}</p>
                  <p className="text-xs text-gray-500">{user.is_admin ? '管理员' : '用户'}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                title="退出登录"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => navigate('/login')}
              className="w-full btn-primary flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              登录
            </button>
          )}
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}