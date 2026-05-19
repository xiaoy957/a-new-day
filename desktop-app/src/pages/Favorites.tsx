import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Star, ChevronRight, Trash2 } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Award } from '../types'

export function Favorites() {
  const navigate = useNavigate()
  const { favorites, removeFavorite, isAuthenticated } = useStore()
  const [favoriteAwards, setFavoriteAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFavorites()
  }, [favorites])

  const loadFavorites = async () => {
    if (favorites.length === 0) {
      setFavoriteAwards([])
      setLoading(false)
      return
    }

    try {
      const awards: Award[] = []
      for (const id of favorites) {
        const data = await window.electronAPI.db.query(
          'SELECT * FROM awards WHERE id = ?',
          [id]
        )
        if (data.length > 0) {
          awards.push(data[0])
        }
      }
      setFavoriteAwards(awards)
    } catch (error) {
      console.error('Load favorites failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    removeFavorite(id)
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

  if (!isAuthenticated) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Star className="w-12 h-12 text-gray-300" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">请先登录</h2>
        <p className="text-gray-500 mb-6">登录后可使用收藏功能</p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          去登录
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <div className="flex items-center gap-3 mb-6">
        <Star className="w-8 h-8 text-yellow-500 fill-current" />
        <h1 className="text-2xl font-bold text-gray-900">我的收藏</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">加载中...</div>
        </div>
      ) : favoriteAwards.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Star className="w-12 h-12" />
          </div>
          <p className="text-lg mb-2">暂无收藏</p>
          <p className="text-sm">去搜索并收藏感兴趣的获奖信息吧</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {favoriteAwards.map((award) => (
            <div
              key={award.id}
              onClick={() => navigate(`/detail/${award.id}`)}
              className="card hover:shadow-md cursor-pointer transition-shadow relative"
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => handleRemove(award.id, e)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    title="取消收藏"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
