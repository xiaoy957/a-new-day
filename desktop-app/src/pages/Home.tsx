import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, TrendingUp, Award, Building2, Trophy, ChevronRight } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Award as AwardType, Stats, LEVEL_COLORS } from '../types'

const quickFilters = [
  { name: '国家级', filter: '国家级' },
  { name: '省级', filter: '省级' },
  { name: '市级', filter: '市级' },
  { name: '2024年', filter: '2024' },
  { name: '2023年', filter: '2023' },
]

export function Home() {
  const navigate = useNavigate()
  const { setSearchKeyword, setStats, stats, triggerRefresh } = useStore()
  const [searchInput, setSearchInput] = useState('')
  const [hotAwards, setHotAwards] = useState<AwardType[]>([])
  const [latestAwards, setLatestAwards] = useState<AwardType[]>([])

  useEffect(() => {
    loadStats()
    loadHotAwards()
    loadLatestAwards()
  }, [])

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.db.getStats()
      setStats(data)
    } catch (error) {
      console.error('Load stats failed:', error)
    }
  }

  const loadHotAwards = async () => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT * FROM awards ORDER BY year DESC LIMIT 5'
      )
      setHotAwards(data)
    } catch (error) {
      console.error('Load hot awards failed:', error)
    }
  }

  const loadLatestAwards = async () => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT * FROM awards ORDER BY created_at DESC LIMIT 5'
      )
      setLatestAwards(data)
    } catch (error) {
      console.error('Load latest awards failed:', error)
    }
  }

  const handleSearch = () => {
    if (searchInput.trim()) {
      setSearchKeyword(searchInput.trim())
      navigate('/search')
    }
  }

  const handleQuickFilter = (filter: string) => {
    setSearchKeyword(filter)
    navigate('/search')
  }

  const getLevelColor = (level?: string) => {
    const colors: Record<string, string> = {
      '国家级': 'bg-red-500',
      '省级': 'bg-orange-500',
      '市级': 'bg-yellow-500',
      '校级': 'bg-green-500'
    }
    return colors[level || ''] || 'bg-gray-500'
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      {/* 头部区域 */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-8">
        <h1 className="text-3xl font-bold mb-2">科研奖励获奖信息查询系统</h1>
        <p className="text-primary-100 mb-6">一站式查询科研获奖成果，支持多维度搜索和统计分析</p>
        
        {/* 搜索框 */}
        <div className="flex gap-4 max-w-2xl">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="请输入姓名、单位、成果名称或奖项名称"
              className="w-full pl-12 pr-4 py-3 rounded-xl text-gray-900 outline-none focus:ring-4 focus:ring-white/20"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-3 bg-white text-primary-600 rounded-xl font-medium hover:bg-gray-50 transition-colors"
          >
            搜索
          </button>
        </div>

        {/* 快捷筛选 */}
        <div className="flex gap-3 mt-4">
          {quickFilters.map((item) => (
            <button
              key={item.name}
              onClick={() => handleQuickFilter(item.filter)}
              className="px-4 py-2 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
            <Trophy className="w-7 h-7 text-primary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.total || 0}</p>
            <p className="text-gray-500">总获奖数</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center">
            <Building2 className="w-7 h-7 text-secondary-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.organizations || 0}</p>
            <p className="text-gray-500">获奖单位</p>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
            <Award className="w-7 h-7 text-orange-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{stats?.awardTypes || 0}</p>
            <p className="text-gray-500">奖项种类</p>
          </div>
        </div>

        <div className="card flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate('/statistics')}>
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <TrendingUp className="w-7 h-7 text-purple-600" />
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">查看统计</p>
            <p className="text-gray-500">详细数据分析</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
        {/* 热门奖项 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">热门奖项</h2>
            <button 
              onClick={() => navigate('/search')}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              更多 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {hotAwards.map((award) => (
              <div
                key={award.id}
                onClick={() => navigate(`/detail/${award.id}`)}
                className="flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className={`w-2 h-12 rounded-full ${getLevelColor(award.level)}`} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{award.name}</h3>
                  <p className="text-sm text-primary-600">{award.award_name}</p>
                  <p className="text-sm text-gray-500">{award.recipients} · {award.year}年</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 最新获奖 */}
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">最新获奖</h2>
            <button 
              onClick={() => navigate('/search')}
              className="text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              更多 <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            {latestAwards.map((award) => (
              <div
                key={award.id}
                onClick={() => navigate(`/detail/${award.id}`)}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{award.name}</h3>
                  <p className="text-sm text-gray-500">{award.award_name} · {award.recipients}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}