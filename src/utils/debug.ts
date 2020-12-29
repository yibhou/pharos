
/**
 * 移动端调试面板
 */

import querystring from 'querystring'

import debug from 'debug'
import eruda from 'eruda'
import VConsole from 'vconsole'

const query = querystring.parse(window.location.search.slice(1))
const isDebugMode = query.debug === '1'
const isDev = process.env.NODE_ENV === 'development'

/**
 * 默认情况 开发环境开启debug
 * 如果isDebugMode为true 则所有环境开启debug
 *
 * 如果想打印指定命名空间的日志 可使用localStorage.debug指定并刷新页面
 * 例如localStorage.debug = 'module:*'
 */
const namespaces = '*,-sockjs-client:*'
const log = debug('debug:*')
if (isDev) {
  debug.enable(namespaces)
} else if (isDebugMode) {
  // 打印所有日志
  debug.enable('*')
} else {
  debug.disable()
}

if (isDebugMode) {
  // eruda调试面板
  eruda.init()
  // vConsole调试面板
  const vConsole = new VConsole()

  log('开启调试模式')
}
