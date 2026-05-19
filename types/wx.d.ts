declare namespace WechatMiniprogram {
  interface App {
    globalData: {
      user: any
      favorites: number[]
    }
  }
}

declare var getApp: () => WechatMiniprogram.App

declare module '*.json' {
  const value: any
  export default value
}