import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search as SearchIcon, Filter, ChevronRight } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Award } from '../types'

const levels = ['全部', '国家级', '省级', '市级', '校级']

export function Search() {
  const navigate = useNavigate()
  const { searchKeyword, setSearchKeyword } = useStore()
  const [keyword, setKeyword] = useState(searchKeyword)
  const [selectedLevel, setSelectedLevel] = useState('全部')
  const [results, setResults] = useState<Award[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    handleSearch()
  }, [searchKeyword, selectedLevel])

  const handleSearch = async () => {
    setLoading(true)
    try {
      let sql = 'SELECT * FROM awards WHERE 1=1'
      const params: any[] = []

      if (keyword.trim()) {
        sql += ` AND (name LIKE ? OR award_name LIKE ? OR recipients LIKE ? OR organization LIKE ?)`
        const pattern = `%${keyword.trim()}%`
        params.push(pattern, pattern, pattern, pattern)
      }

      if (selectedLevel !== '全部') {
        sql += ` AND level = ?`
        params.push(selectedLevel)
      }

      sql += ' ORDER BY year DESC'

      const data = await window.electronAPI.db.query(sql, params)
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setLoading(false)
    }
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
    <div className="h-full flex flex-col">
      {/* 搜索头部 */}
      <div className="bg-white border-b p-6">
        <div className="flex gap-4 max-w-3xl">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="搜索姓名、单位、成果名称或奖项名称"
              className="input pl-12"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            onClick={handleSearch}
            className="btn-primary flex items-center gap-2"
          >
            <SearchIcon className="w-4 h-4" />
            搜索
          </button>
        </div>

        {/* 等级筛选 */}
        <div className="flex items-center gap-3 mt-4">
          <Filter className="w-4 h-4 text-gray-400" />
          <div className="flex gap-2">
            {levels.map((level) => (
              <button
                key={level}
                onClick={() => setSelectedLevel(level)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedLevel === level
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 搜索结果 */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-4 text-gray-500">
          共找到 <span className="font-medium text-gray-900">{results.length}</span> 条结果
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">搜索中...</div>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <SearchIcon className="w-16 h-16 mb-4" />
            <p className="text-lg">暂无搜索结果</p>
            <p className="text-sm">请尝试其他关键词</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {results.map((award) => (
              <div
                key={award.id}
                onClick={() => navigate(`/detail/${award.id}`)}
                className="card hover:shadow-md cursor-pointer transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-2 py-1 text-xs text-white rounded ${getLevelColor(award.level)}`}>
                        {award.level}
                      </span>
                      <span className="text-sm text-gray-500">{award.year}年</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">{award.name}</h3>
                    <p className="text-primary-600 mb-2">{award.award_name}</p>
                    <div className="text-sm text-gray-500 space-y-1">
                      <p>获奖人: {award.recipients}</p>
                      <p>获奖单位: {award.organization}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}