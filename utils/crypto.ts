const SECRET_KEY = 'research-award-system-key'

function simpleEncrypt(text: string): string {
  let result = ''
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
    result += String.fromCharCode(charCode)
  }
  return btoa(result)
}

function simpleDecrypt(encoded: string): string {
  try {
    const text = atob(encoded)
    let result = ''
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length)
      result += String.fromCharCode(charCode)
    }
    return result
  } catch {
    return ''
  }
}

export function encryptStorage(key: string, value: any): void {
  try {
    const encrypted = simpleEncrypt(JSON.stringify(value))
    wx.setStorageSync(key, encrypted)
  } catch {
    // 降级处理，直接存储
    wx.setStorageSync(key, value)
  }
}

export function decryptStorage(key: string): any {
  try {
    const encrypted = wx.getStorageSync(key)
    if (!encrypted) return null
    const decrypted = simpleDecrypt(encrypted)
    return JSON.parse(decrypted)
  } catch {
    try {
      return wx.getStorageSync(key)
    } catch {
      return null
    }
  }
}

export function removeStorage(key: string): void {
  wx.removeStorageSync(key)
}