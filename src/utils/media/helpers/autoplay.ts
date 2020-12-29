/**
 * 媒体自动播放助手
 */

let isWeixinJSBridgeReady = false

function weixinJSBridgeReady(callback?: () => void) {
  const handler = () => {
    // 微信JS桥准备就绪
    isWeixinJSBridgeReady = true
    callback && callback()
  }
  // 避免事件重复注册
  document.removeEventListener('WeixinJSBridgeReady', handler, false)
  // 在微信中JS必须与页面同步加载 否则可能有监听不了该事件的问题
  document.addEventListener('WeixinJSBridgeReady', handler, false)
}

if (isWeiXin()) {
  // 加载JS立即监听 避免页面监听不到事件触发的情况
  // 之前遇到过Vue的created|mounted钩子函数监听不到事件 还有异步组件延迟加载时也监听不到
  weixinJSBridgeReady()
}

/**
 * 自动播放准备就绪
 * 自动播放的具体逻辑由handler方法实现
 */
function autoplayReady(media: HTMLMediaElement[], handler: () => void) {
  const readyHandler = function(done?: () => void) {
    // 判断所有媒体是否成功播放
    Promise.all(media.map(dom => {
      // 必须播放一次 其他地方才能播放
      return play(dom).then(() => {
        return pause(dom)
      })
    })).then(() => {
      handler()
      done && done()
    }).catch(e => {

    })
  }

  /**
   * 微信自动播放
   */
  if (isWeiXin()) {
    const weixinHandler = () => {
      // 微信必须主动调用getNetworkType来播放
      window.WeixinJSBridge.invoke('getNetworkType', {}, (e: unknown) => {
        readyHandler()
      })
    }
    // 如果JS桥已就绪 直接执行回调
    if (isWeixinJSBridgeReady) {
      weixinHandler()
    } else {
      weixinJSBridgeReady(weixinHandler)
    }
  } else {
    // 尝试自动播放触发
    readyHandler()
    /**
     * 触摸时自动播放
     */
    const playHandler = () => {
      readyHandler(() => {
        // 成功播放后 取消事件监听
        document.removeEventListener('touchstart', playHandler, false)
      })
    }
    // 此处会有多次调用方法时注册多次事件的问题 需要通过id识别不同方法调用
    document.addEventListener('touchstart', playHandler, false)
  }
}

function play(media: HTMLMediaElement, options: { currentTime?: number } = {}) {
  return new Promise<void>((resolve, reject) => {
    if (media.paused) {
      const promise = media.play()

      media.currentTime = options.currentTime || media.currentTime

      if (promise !== undefined) {
        promise.then(() => {
          resolve()
        }).catch(error => {
          reject(error)
          console.log('播放失败：' + error)
        })
      } else {
        reject()
      }
    } else {
      resolve()
    }
  })
}

function pause(media: HTMLMediaElement, options = {}) {
  return new Promise<void>(resolve => {
    if (media.paused) {
      resolve()
    } else {
      media.pause()
      resolve()
    }
  })
}

// 是否微信客户端
function isWeiXin() {
  const userAgent = window.navigator.userAgent.toLowerCase()
  return /MicroMessenger/i.test(userAgent)
}

export default {
  autoplayReady,
  play,
  pause
}
