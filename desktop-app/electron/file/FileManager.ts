import * as XLSX from 'xlsx'
import fs from 'fs'
import path from 'path'
import { Award } from '../database/DatabaseManager'

export class FileManager {
  async importExcel(filePath: string): Promise<Partial<Award>[]> {
    const workbook = XLSX.readFile(filePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = XLSX.utils.sheet_to_json(worksheet)

    return data.map((row: any) => ({
      name: row['成果名称'] || row['name'] || '',
      award_name: row['奖项名称'] || row['award_name'] || '',
      category: row['奖项类别'] || row['category'] || '',
      level: row['奖项等级'] || row['level'] || '',
      year: parseInt(row['获奖年份'] || row['year']) || undefined,
      session: parseInt(row['届数'] || row['session']) || undefined,
      recipients: row['获奖人'] || row['recipients'] || '',
      organization: row['获奖单位'] || row['organization'] || '',
      department: row['获奖部门'] || row['department'] || '',
      description: row['成果描述'] || row['description'] || ''
    }))
  }

  async importTxt(filePath: string): Promise<Partial<Award>[]> {
    const content = fs.readFileSync(filePath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())
    
    const results: Partial<Award>[] = []
    
    for (const line of lines) {
      // 支持制表符分隔或逗号分隔
      const parts = line.includes('\t') ? line.split('\t') : line.split(',')
      
      if (parts.length >= 6) {
        results.push({
          name: parts[0]?.trim() || '',
          award_name: parts[1]?.trim() || '',
          category: parts[2]?.trim() || '',
          level: parts[3]?.trim() || '',
          year: parseInt(parts[4]?.trim()) || undefined,
          session: parseInt(parts[5]?.trim()) || undefined,
          recipients: parts[6]?.trim() || '',
          organization: parts[7]?.trim() || '',
          department: parts[8]?.trim() || '',
          description: parts[9]?.trim() || ''
        })
      }
    }
    
    return results
  }

  async exportExcel(filePath: string, data: any[]): Promise<void> {
    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, '获奖信息')
    XLSX.writeFile(workbook, filePath)
  }
}