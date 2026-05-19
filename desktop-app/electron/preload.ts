import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的 API
contextBridge.exposeInMainWorld('electronAPI', {
  // 数据库操作
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db:query', sql, params),
    exec: (sql: string) => ipcRenderer.invoke('db:exec', sql),
    insert: (table: string, data: Record<string, any>) => ipcRenderer.invoke('db:insert', table, data),
    update: (table: string, id: number, data: Record<string, any>) => ipcRenderer.invoke('db:update', table, id, data),
    delete: (table: string, id: number) => ipcRenderer.invoke('db:delete', table, id),
    getStats: () => ipcRenderer.invoke('db:getStats')
  },
  
  // 文件操作
  file: {
    importExcel: () => ipcRenderer.invoke('file:importExcel'),
    importTxt: () => ipcRenderer.invoke('file:importTxt'),
    exportExcel: (data: any[]) => ipcRenderer.invoke('file:exportExcel', data)
  }
})

// 类型声明
declare global {
  interface Window {
    electronAPI: {
      db: {
        query: (sql: string, params?: any[]) => Promise<any[]>
        exec: (sql: string) => Promise<void>
        insert: (table: string, data: Record<string, any>) => Promise<number>
        update: (table: string, id: number, data: Record<string, any>) => Promise<void>
        delete: (table: string, id: number) => Promise<void>
        getStats: () => Promise<any>
      }
      file: {
        importExcel: () => Promise<number | null>
        importTxt: () => Promise<number | null>
        exportExcel: (data: any[]) => Promise<string | null>
      }
    }
  }
}