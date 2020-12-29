// 日志等级
export type LogLevel = 'log' | 'info' | 'warn' | 'error'

// 微信分享数据
export interface ShareData {
  title: string
  desc?: string
  link: string
  imgUrl: string
}
