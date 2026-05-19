import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Star, Calendar, Users, Building, Award, FileText } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Award as AwardType } from '../types'

export function Detail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isFavorite, addFavorite, removeFavorite } = useStore()
  const [award, setAward] = useState<AwardType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      loadAward(parseInt(id))
    }
  }, [id])

  const loadAward = async (awardId: number) => {
    try {
      const data = await window.electronAPI.db.query(
        'SELECT * FROM awards WHERE id = ?',
        [awardId]
      )
      if (data.length > 0) {
        setAward(data[0])
      }
    } catch (error) {
      console.error('Load award failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = () => {
    if (!award) return
    
    if (isFavorite(award.id)) {
      removeFavorite(award.id)
    } else {
      addFavorite(award.id)
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!award) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">未找到该奖项信息</p>
        <button onClick={() => navigate(-1)} className="btn-primary">
          返回
        </button>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto p-8">
      <button 
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        返回
      </button>

      <div className="max-w-4xl">
        {/* 头部卡片 */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-8 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <span className={`px-3 py-1 text-sm rounded-full ${getLevelColor(award.level)}`}>
              {award.level}
            </span>
            <span className="text-primary-100">{award.year}年</span>
            {award.session && <span className="text-primary-100">第{award.session}届</span>}
          </div>
          <h1 className="text-2xl font-bold mb-2">{award.name}</h1>
          <p className="text-primary-100">{award.award_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* 获奖信息 */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">获奖信息</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">获奖人</p>
                  <p className="font-medium text-gray-900">{award.recipients}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">获奖单位</p>
                  <p className="font-medium text-gray-900">{award.organization}</p>
                </div>
              </div>

              {award.department && (
                <div className="flex items-start gap-3">
                  <Award className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">获奖部门</p>
                    <p className="font-medium text-gray-900">{award.department}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">奖项类别</p>
                  <p className="font-medium text-gray-900">{award.category || '未分类'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 时间信息 */}
          <div className="card">
            <h2 className="text-lg font-bold text-gray-900 mb-4">时间信息</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">创建时间</p>
                <p className="font-medium text-gray-900">
                  {award.created_at ? new Date(award.created_at).toLocaleString('zh-CN') : '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">更新时间</p>
                <p className="font-medium text-gray-900">
                  {award.updated_at ? new Date(award.updated_at).toLocaleString('zh-CN') : '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 成果描述 */}
        {award.description && (
          <div className="card mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              成果描述
            </h2>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
              {award.description}
            </p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <button
            onClick={handleFavorite}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-colors ${
              isFavorite(award.id)
                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Star className={`w-5 h-5 ${isFavorite(award.id) ? 'fill-current' : ''}`} />
            {isFavorite(award.id) ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>
    </div>
  )
}
