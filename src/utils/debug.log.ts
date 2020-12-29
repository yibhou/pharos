import { debug } from 'debug'
import type { LogLevel } from '@/types/utils'

const log = debug('logger:*')

/**
 * 调试日志
 * @param level 日志等级 log|info|warn|error
 */
function Logger(namespace: string, level: LogLevel = 'log') {
  const logger = debug(namespace)
  if (console[level]) {
    logger.log = console[level].bind(console)
  }
  return function(formatter: any, ...args: any[]) {
    // 避免某些手机不支持某些日志等级或日志参数
    try {
      if (debug.enabled(namespace)) {
        logger(formatter, ...args)
      }
    } catch (e) {
      log(`不支持输出该日志类型：${e}`)
    }
  }
}

export default Logger
