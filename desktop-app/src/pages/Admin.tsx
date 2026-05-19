import { useEffect, useState } from 'react'
import { Plus, Upload, Edit2, Trash2, Search, X } from 'lucide-react'
import { useStore } from '../stores/useStore'
import { Award } from '../types'

export function Admin() {
  const { user, triggerRefresh } = useStore()
  const [awards, setAwards] = useState<Award[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingAward, setEditingAward] = useState<Award | null>(null)
  const [formData, setFormData] = useState({
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
  })
  const [searchKeyword, setSearchKeyword] = useState('')

  useEffect(() => {
    loadAwards()
  }, [])

  const loadAwards = async () => {
    setLoading(true)
    try {
      const data = await window.electronAPI.db.query(
        'SELECT * FROM awards ORDER BY year DESC'
      )
      setAwards(data)
    } catch (error) {
      console.error('Load awards failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImportExcel = async () => {
    try {
      const count = await window.electronAPI.file.importExcel()
      if (count !== null) {
        alert(`成功导入 ${count} 条数据`)
        loadAwards()
        triggerRefresh()
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('导入失败')
    }
  }

  const handleImportTxt = async () => {
    try {
      const count = await window.electronAPI.file.importTxt()
      if (count !== null) {
        alert(`成功导入 ${count} 条数据`)
        loadAwards()
        triggerRefresh()
      }
    } catch (error) {
      console.error('Import failed:', error)
      alert('导入失败')
    }
  }

  const handleAdd = () => {
    setEditingAward(null)
    setFormData({
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
    })
    setShowModal(true)
  }

  const handleEdit = (award: Award) => {
    setEditingAward(award)
    setFormData({
      name: award.name,
      award_name: award.award_name,
      category: award.category || '',
      level: award.level || '',
      year: award.year?.toString() || '',
      session: award.session?.toString() || '',
      recipients: award.recipients || '',
      organization: award.organization || '',
      department: award.department || '',
      description: award.description || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条获奖信息吗？')) return
    try {
      await window.electronAPI.db.delete('awards', id)
      alert('删除成功')
      loadAwards()
      triggerRefresh()
    } catch (error) {
      console.error('Delete failed:', error)
      alert('删除失败')
    }
  }

  const handleSubmit = async () => {
    if (!formData.name || !formData.award_name) {
      alert('请填写必填项')
      return
    }

    try {
      const data = {
        ...formData,
        year: formData.year ? parseInt(formData.year) : null,
        session: formData.session ? parseInt(formData.session) : null
      }

      if (editingAward) {
        await window.electronAPI.db.update('awards', editingAward.id, data)
        alert('更新成功')
      } else {
        await window.electronAPI.db.insert('awards', data)
        alert('添加成功')
      }

      setShowModal(false)
      loadAwards()
      triggerRefresh()
    } catch (error) {
      console.error('Submit failed:', error)
      alert('操作失败')
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

  const filteredAwards = awards.filter(award => {
    if (!searchKeyword) return true
    const keyword = searchKeyword.toLowerCase()
    return (
      award.name.toLowerCase().includes(keyword) ||
      award.award_name.toLowerCase().includes(keyword) ||
      award.recipients?.toLowerCase().includes(keyword) ||
      award.organization?.toLowerCase().includes(keyword)
    )
  })

  return (
    <div className="h-full flex flex-col">
      {/* 头部 */}
      <div className="bg-white border-b p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">数据管理</h1>
          <div className="flex gap-4">
            <button
              onClick={handleImportExcel}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入Excel
            </button>
            <button
              onClick={handleImportTxt}
              className="btn-secondary flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              导入TXT
            </button>
            <button
              onClick={handleAdd}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              添加
            </button>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="mt-4 relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="搜索获奖信息..."
            className="input pl-10"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* 表格 */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">加载中...</div>
          </div>
        ) : filteredAwards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>暂无数据</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">等级</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">成果名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">奖项名称</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">获奖人</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">单位</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">年份</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAwards.map((award) => (
                  <tr key={award.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs text-white rounded ${getLevelColor(award.level)}`}>
                        {award.level}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{award.name}</td>
                    <td className="px-6 py-4 text-sm text-primary-600">{award.award_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{award.recipients}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{award.organization}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{award.year}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleEdit(award)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(award.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingAward ? '编辑获奖信息' : '添加获奖信息'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    成果名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    奖项名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.award_name}
                    onChange={(e) => setFormData({ ...formData, award_name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">奖项等级</label>
                  <select
                    className="input"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                  >
                    <option value="">请选择</option>
                    <option value="国家级">国家级</option>
                    <option value="省级">省级</option>
                    <option value="市级">市级</option>
                    <option value="校级">校级</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">奖项类别</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">获奖年份</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">届数</label>
                  <input
                    type="number"
                    className="input"
                    value={formData.session}
                    onChange={(e) => setFormData({ ...formData, session: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    获奖人 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    获奖单位 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={formData.organization}
                    onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">获奖部门</label>
                  <input
                    type="text"
                    className="input"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">成果描述</label>
                  <textarea
                    className="input min-h-[100px]"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-4 p-6 border-t bg-gray-50">
              <button onClick={() => setShowModal(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-100">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                确认
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
