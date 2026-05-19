import initSqlJs, { Database as SqlJsDatabase } from 'sql.js'
import path from 'path'
import fs from 'fs'
import { app } from 'electron'

export interface Award {
  id?: number
  name: string
  award_name: string
  category?: string
  level?: string
  year?: number
  session?: number
  recipients?: string
  organization?: string
  department?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export class DatabaseManager {
  private db: SqlJsDatabase | null = null
  private dbPath: string
  private saveTimer: NodeJS.Timeout | null = null

  constructor(userDataPath: string) {
    const dbDir = path.join(userDataPath, 'database')
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true })
    }
    this.dbPath = path.join(dbDir, 'awards.db')
  }

  async init(): Promise<void> {
    const SQL = await initSqlJs({
      locateFile: (file: string) => {
        if (app.isPackaged) {
          return path.join(process.resourcesPath, file)
        }
        return path.join(__dirname, '..', 'node_modules', 'sql.js', 'dist', file)
      }
    })

    if (fs.existsSync(this.dbPath)) {
      const buffer = fs.readFileSync(this.dbPath)
      this.db = new SQL.Database(buffer)
    } else {
      this.db = new SQL.Database()
    }

    this.initTables()
  }

  private initTables(): void {
    if (!this.db) return

    this.db.run(`
      CREATE TABLE IF NOT EXISTS awards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        award_name TEXT NOT NULL,
        category TEXT,
        level TEXT,
        year INTEGER,
        session INTEGER,
        recipients TEXT,
        organization TEXT,
        department TEXT,
        description TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        nickname TEXT,
        is_admin INTEGER DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `)

    this.db.run(`
      CREATE TABLE IF NOT EXISTS favorites (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        award_id INTEGER,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(user_id, award_id)
      )
    `)

    this.db.run('CREATE INDEX IF NOT EXISTS idx_awards_name ON awards(name)')
    this.db.run('CREATE INDEX IF NOT EXISTS idx_awards_award_name ON awards(award_name)')
    this.db.run('CREATE INDEX IF NOT EXISTS idx_awards_recipients ON awards(recipients)')
    this.db.run('CREATE INDEX IF NOT EXISTS idx_awards_organization ON awards(organization)')
    this.db.run('CREATE INDEX IF NOT EXISTS idx_awards_year ON awards(year)')

    const adminCheck = this.db.exec("SELECT COUNT(*) as count FROM users WHERE username = 'admin'")
    if (adminCheck[0] && adminCheck[0].values[0][0] === 0) {
      this.db.run(
        "INSERT INTO users (username, password_hash, nickname, is_admin) VALUES (?, ?, ?, ?)",
        ['admin', 'admin123', '系统管理员', 1]
      )
    }

    this.insertSampleData()
    this.save()
  }

  private insertSampleData(): void {
    if (!this.db) return

    const count = this.db.exec('SELECT COUNT(*) as count FROM awards')
    if (count[0] && (count[0].values[0][0] as number) > 0) return

    const sampleData = [
      ['高性能计算在材料科学中的应用', '国家自然科学奖', '自然科学', '国家级', 2023, 5, '张三, 李四', '清华大学', '计算机科学与技术系', '该研究将高性能计算技术应用于新材料的开发，取得了突破性成果。'],
      ['人工智能在医学影像诊断中的研究', '国家科技进步奖', '科技进步', '国家级', 2023, 7, '王五, 赵六', '北京大学', '人工智能研究院', '开发了一套基于深度学习的医学影像诊断系统，准确率达到95%以上。'],
      ['新型能源材料的研发', '北京市科学技术奖', '科学技术', '市级', 2022, 12, '钱七, 孙八', '北京理工大学', '材料科学与工程学院', '研发的新型电池材料显著提升了能量密度。'],
      ['量子计算理论研究', '国家自然科学奖', '自然科学', '国家级', 2022, 4, '周九', '中国科学院', '计算技术研究所', '在量子算法设计方面取得重要突破。'],
      ['5G通信网络优化', '广东省科技进步奖', '科技进步', '省级', 2023, 8, '吴十, 郑十一', '华南理工大学', '电子与信息学院', '提出的通信网络优化方案提升了网络效率30%。']
    ]

    for (const data of sampleData) {
      this.db.run(
        'INSERT INTO awards (name, award_name, category, level, year, session, recipients, organization, department, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        data as any[]
      )
    }
  }

  private save(): void {
    if (!this.db) return
    const data = this.db.export()
    const buffer = Buffer.from(data)
    fs.writeFileSync(this.dbPath, buffer)
  }

  query(sql: string, params?: any[]): any[] {
    if (!this.db) return []
    
    try {
      const stmt = this.db.prepare(sql)
      if (params) {
        stmt.bind(params)
      }
      
      const results: any[] = []
      while (stmt.step()) {
        const row = stmt.getAsObject()
        results.push(row)
      }
      stmt.free()
      return results
    } catch (error) {
      console.error('Query error:', error)
      return []
    }
  }

  exec(sql: string): void {
    if (!this.db) return
    this.db.run(sql)
    this.save()
  }

  insert(table: string, data: Record<string, any>): number {
    if (!this.db) return -1
    
    const keys = Object.keys(data)
    const values = Object.values(data)
    const placeholders = keys.map(() => '?').join(', ')
    
    this.db.run(
      `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`,
      values as any[]
    )
    
    const result = this.db.exec('SELECT last_insert_rowid() as id')
    this.save()
    return result[0]?.values[0][0] as number || -1
  }

  update(table: string, id: number, data: Record<string, any>): void {
    if (!this.db) return
    
    const keys = Object.keys(data)
    const values = Object.values(data)
    const setClause = keys.map(k => `${k} = ?`).join(', ')
    
    this.db.run(
      `UPDATE ${table} SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
      [...values, id] as any[]
    )
    this.save()
  }

  delete(table: string, id: number): void {
    if (!this.db) return
    this.db.run(`DELETE FROM ${table} WHERE id = ?`, [id])
    this.save()
  }

  getStats() {
    const total = this.query('SELECT COUNT(*) as count FROM awards')[0]?.count || 0
    const national = this.query("SELECT COUNT(*) as count FROM awards WHERE level = '国家级'")[0]?.count || 0
    const provincial = this.query("SELECT COUNT(*) as count FROM awards WHERE level = '省级'")[0]?.count || 0
    const municipal = this.query("SELECT COUNT(*) as count FROM awards WHERE level = '市级'")[0]?.count || 0
    const school = this.query("SELECT COUNT(*) as count FROM awards WHERE level = '校级'")[0]?.count || 0
    const orgs = this.query('SELECT COUNT(DISTINCT organization) as count FROM awards')[0]?.count || 0
    const awards = this.query('SELECT COUNT(DISTINCT award_name) as count FROM awards')[0]?.count || 0

    return { total, national, provincial, municipal, school, organizations: orgs, awardTypes: awards }
  }

  close(): void {
    if (this.db) {
      this.save()
      this.db.close()
      this.db = null
    }
  }
}
