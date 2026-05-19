import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'path'
import { DatabaseManager } from './database/DatabaseManager'
import { FileManager } from './file/FileManager'

let mainWindow: BrowserWindow | null = null
let dbManager: DatabaseManager | null = null
let fileManager: FileManager | null = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    title: '科研奖励获奖信息查询系统'
  })

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(async () => {
  const userDataPath = app.getPath('userData')
  dbManager = new DatabaseManager(userDataPath)
  await dbManager.init()
  fileManager = new FileManager()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (dbManager) {
      dbManager.close()
    }
    app.quit()
  }
})

ipcMain.handle('db:query', async (_, sql: string, params?: any[]) => {
  if (!dbManager) return []
  return dbManager.query(sql, params)
})

ipcMain.handle('db:exec', async (_, sql: string) => {
  if (!dbManager) return
  dbManager.exec(sql)
})

ipcMain.handle('db:insert', async (_, table: string, data: Record<string, any>) => {
  if (!dbManager) return -1
  return dbManager.insert(table, data)
})

ipcMain.handle('db:update', async (_, table: string, id: number, data: Record<string, any>) => {
  if (!dbManager) return
  dbManager.update(table, id, data)
})

ipcMain.handle('db:delete', async (_, table: string, id: number) => {
  if (!dbManager) return
  dbManager.delete(table, id)
})

ipcMain.handle('db:getStats', async () => {
  if (!dbManager) return null
  return dbManager.getStats()
})

ipcMain.handle('file:importExcel', async () => {
  if (!fileManager || !dbManager) return null
  
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Excel Files', extensions: ['xlsx', 'xls'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const data = await fileManager.importExcel(result.filePaths[0])
  
  for (const item of data) {
    await dbManager.insert('awards', item)
  }
  
  return data.length
})

ipcMain.handle('file:importTxt', async () => {
  if (!fileManager || !dbManager) return null
  
  const result = await dialog.showOpenDialog(mainWindow!, {
    properties: ['openFile'],
    filters: [
      { name: 'Text Files', extensions: ['txt'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  if (result.canceled || result.filePaths.length === 0) {
    return null
  }

  const data = await fileManager.importTxt(result.filePaths[0])
  
  for (const item of data) {
    await dbManager.insert('awards', item)
  }
  
  return data.length
})

ipcMain.handle('file:exportExcel', async (_, data: any[]) => {
  if (!fileManager) return null
  
  const result = await dialog.showSaveDialog(mainWindow!, {
    filters: [
      { name: 'Excel Files', extensions: ['xlsx'] }
    ],
    defaultPath: '获奖信息导出.xlsx'
  })

  if (result.canceled || !result.filePath) {
    return null
  }

  await fileManager.exportExcel(result.filePath, data)
  return result.filePath
})