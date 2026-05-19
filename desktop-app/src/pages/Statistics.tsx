import { useEffect, useState } from 'react'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { useStore } from '../stores/useStore'
import { Trophy, Building2, Award, TrendingUp } from 'lucide-react'
import { Stats } from '../types'

const LEVEL_COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E']

export function Statistics() {
  const { stats, setStats } = useStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'trend' | 'person' | 'org'>('overview')
  const [trendData, setTrendData] = useState<any[]>([])
  const [topRecipients, setTopRecipients] = useState<any[]>([])
  const [topOrgs, setTopOrgs] = useState<any[]>([])
  const [personKeyword, setPersonKeyword] = useState('')
  const [personResult, setPersonResult] = useState<any>(null)
  const [orgKeyword, setOrgKeyword] = useState('')
  const [orgResult, setOrgResult] = useState<any>(null)

  useEffect(() => {
    loadStats()
    loadTrendData()
    loadTopRecipients()
    loadTopOrgs()
  }, [])

  const loadStats = async () => {
    try {
      const data = await window.electronAPI.db.getStats()
      setStats(data)
    } catch (error) {
      console.error('Load stats failed:', error)
    }
  }

  const loadTrendData = async () => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT year, COUNT(*) as count FROM awards GROUP BY year ORDER BY year'
      )
      setTrendData(data)
    } catch (error) {
      console.error('Load trend data failed:', error)
    }
  }

  const loadTopRecipients = async () => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT recipients FROM awards'
      )
      const recipientMap: Record<string, number> = {}
      data.forEach((item: any) => {
        const names = (item.recipients || '').split(/[,，、]/).filter((n: string) => n.trim())
        names.forEach((name: string) => {
          recipientMap[name.trim()] = (recipientMap[name.trim()] || 0) + 1
        })
      })
      const top = Object.entries(recipientMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
      setTopRecipients(top)
    } catch (error) {
      console.error('Load top recipients failed:', error)
    }
  }

  const loadTopOrgs = async () => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT organization, COUNT(*) as count FROM awards GROUP BY organization ORDER BY count DESC LIMIT 10'
      )
      setTopOrgs(data)
    } catch (error) {
      console.error('Load top orgs failed:', error)
    }
  }

  const searchPerson = async () => {
    if (!personKeyword.trim()) return
    try {
      const data = await window.electronAPI.db.query(
        `SELECT * FROM awards WHERE recipients LIKE ?`,
        [`%${personKeyword}%`]
      )
      setPersonResult({ count: data.length, awards: data })
    } catch (error) {
      console.error('Search person failed:', error)
    }
  }

  const searchOrg = async () => {
    if (!orgKeyword.trim()) return
    try {
      const data = await window.electronAPI.db.query(
        `SELECT * FROM awards WHERE organization LIKE ?`,
        [`%${orgKeyword}%`]
      )
      setOrgResult({ count: data.length, awards: data })
    } catch (error) {
      console.error('Search org failed:', error)
    }
  }

  const pieData = stats ? [
    { name: '国家级', value: stats.national },
    { name: '省级', value: stats.provincial },
    { name: '市级', value: stats.municipal },
    { name: '校级', value: stats.school },
  ] : []

  const tabs = [
    { key: 'overview', label: '概览' },
    { key: 'trend', label: '趋势' },
    { key: 'person', label: '个人统计' },
    { key: 'org', label: '单位统计' },
  ]

  return (
    <div className="h-full overflow-y-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">统计分析</h1>

      {/* 标签切换 */}
      <div className="flex gap-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-6">
          {/* 统计卡片 */}
          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-primary-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats?.total || 0}</p>
                <p className="text-gray-500">总获奖数</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-secondary-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-7 h-7 text-secondary-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats?.organizations || 0}</p>
                <p className="text-gray-500">获奖单位</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                <Award className="w-7 h-7 text-orange-600" />
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{stats?.awardTypes || 0}</p>
                <p className="text-gray-500">奖项种类</p>
              </div>
            </div>
          </div>

          {/* 饼图 */}
          <div className="col-span-2 card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">奖项等级分布</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 柱状图 */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">获奖数量</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={pieData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value">
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={LEVEL_COLORS[index]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'trend' && (
        <div className="card">
          <h2 className="text-lg font-bold text-gray-900 mb-4">历年获奖趋势</h2>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={trendData}>
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'person' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">查询个人获奖</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="输入姓名查询获奖数"
                className="input flex-1"
                value={personKeyword}
                onChange={(e) => setPersonKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchPerson()}
              />
              <button onClick={searchPerson} className="btn-primary">查询</button>
            </div>
            {personResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium">
                  <span className="text-primary-600">{personKeyword}</span> 共获奖 
                  <span className="text-2xl font-bold text-primary-600 mx-2">{personResult.count}</span> 次
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">获奖次数 Top 10</h2>
            <div className="space-y-3">
              {topRecipients.map((item, index) => (
                <div key={item.name} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-red-500 text-white' :
                    index === 1 ? 'bg-orange-500 text-white' :
                    index === 2 ? 'bg-yellow-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 font-medium text-gray-900">{item.name}</span>
                  <span className="text-primary-600 font-bold">{item.count}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'org' && (
        <div className="space-y-6">
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">查询单位获奖</h2>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="输入单位名称"
                className="input flex-1"
                value={orgKeyword}
                onChange={(e) => setOrgKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && searchOrg()}
              />
              <button onClick={searchOrg} className="btn-primary">查询</button>
            </div>
            {orgResult && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-lg font-medium">
                  <span className="text-primary-600">{orgKeyword}</span> 共获奖 
                  <span className="text-2xl font-bold text-primary-600 mx-2">{orgResult.count}</span> 次
                </p>
              </div>
            )}
          </div>

          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">获奖单位 Top 10</h2>
            <div className="space-y-3">
              {topOrgs.map((item, index) => (
                <div key={item.organization} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    index === 0 ? 'bg-red-500 text-white' :
                    index === 1 ? 'bg-orange-500 text-white' :
                    index === 2 ? 'bg-yellow-500 text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="flex-1 font-medium text-gray-900">{item.organization}</span>
                  <span className="text-primary-600 font-bold">{item.count}次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
