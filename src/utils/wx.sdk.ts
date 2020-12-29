/* eslint-disable no-undef */

/**
 * 微信sdk入口
 */

import wx from 'weixin-js-sdk-ts'
import { getJSON } from '@/utils/request'
import share from './wx.sdk.share'

import type { ShareData } from '@/types/utils'

interface AuthRequestOptions {
  tokenUrl: string
  appId?: string
}
interface AuthRequest {
  isReady?: boolean
  (options: AuthRequestOptions, success?: () => void): void
}

// 自定义配置
const wechatConfig = {
  debug: false // 是否开启调试模式
}
// 必填 微信需要使用的JS接口列表
const jsApiList: wx.jsApiList = [
  'updateAppMessageShareData', // 分享给朋友 JSSDK1.4.0+版本支持
  'updateTimelineShareData', // 分享到朋友圈 JSSDK1.4.0+版本支持
  'onMenuShareAppMessage', // 分享给朋友 即将废弃 兼容微信6.7.2-版本
  'onMenuShareTimeline' // 分享到朋友圈 即将废弃 兼容微信6.7.2-版本
]

const openTagList: wx.openTagList = []

// 微信所需的权限验证配置
const authConfig = {
  debug: wechatConfig.debug, // 调试模式
  appId: '', // 必填 公众号的唯一标识
  timestamp: 0, // 必填 生成签名的时间戳
  nonceStr: '', // 必填 生成签名的随机串
  signature: '', // 必填 签名
  jsApiList,
  openTagList
}
// 检查支持指定JS接口列表的结果
let supportedApiMap: { [api: string]: boolean } = {}
// 是否已经初始化
let initialized = false

/**
 * sdk初始化方法
 * @param {String} options.tokenUrl 获取token的接口地址
 * @param {String} options.appId 可选参数 使用第三方平台时需要
 */
function init(options: AuthRequestOptions, done?: () => void) {
  return new Promise<void>(resolve => {
    if (initialized) {
      done && done()
      resolve()
    } else {
      getWechatAuth(options, function() {
        setAuthConfig(function() {
          initialized = true
          done && done()
          resolve()
        })
      })
    }
  })
}

/**
 * 获取权限验证配置
 * @param {String} tokenUrl 获取token的接口地址
 * @param {String} appId 可选参数 使用第三方平台时需要
 * @param {Function} success 成功回调方法
 */
const getWechatAuth: AuthRequest = function({
  tokenUrl = '',
  appId = ''
}, success) {
  const uri = encodeURIComponent(window.location.href.split('#')[0])
  return getJSON(tokenUrl, {
    uri,
    appId
  }).then(({ json }) => {
    if (json) {
      Object.assign(authConfig, {
        appId: json.appId, // 必填 公众号的唯一标识
        timestamp: json.timestamp, // 必填 生成签名的时间戳
        nonceStr: json.nonceStr, // 必填 生成签名的随机串
        signature: json.signature // 必填 签名
      })
      // 获取权限验证配置成功
      getWechatAuth.isReady = true

      if (typeof success === 'function') {
        success()
      }
    }
  })
}

/**
 * 设置微信权限信息
 * @param {Function} success 成功回调方法
 */
function setAuthConfig(success?: () => void) {
  if (getWechatAuth.isReady !== true) {
    throw new Error('必须获取微信权限验证配置！')
  }
  // 注入权限验证配置
  wx.config(authConfig)

  wx.ready(function() {
    // 判断当前客户端版本是否支持指定JS接口列表 1.6版本+将废弃
    wx.checkJsApi({
      jsApiList: jsApiList,
      success: function(json) {
        if (json.checkResult) {
          supportedApiMap = json.checkResult
          debug('当前客户端支持接口：', json)

          if (typeof success === 'function') {
            success()
          }
        }
      }
    })
  })

  // 权限验证失败
  wx.error(function(error) {
    debug('权限验证失败：', error)
  })
}

/**
 * 输出调试消息
 */
function debug(...args: unknown[]) {
  if (wechatConfig.debug) {
    let message = ''
    Array.prototype.slice.call(arguments).forEach(function(value) {
      message += typeof value === 'string' ? value : JSON.stringify(value)
    })
    alert(message)
    return message
  }
}

/**
 * 微信分享
 * @param {Object} data 分享数据 { title, desc, link, imgUrl }
 */
function setDefaultShare(data: ShareData, success?: () => void, cancel?: () => void) {
  share.setDefaultShare({
    supportedApiMap,
    data,
    trigger: function(methodName: string) {
      debug(`${methodName} -> 触发分享`)
    },
    success: function(methodName: string) {
      debug(`${methodName} -> 分享成功`)
      success && success()
    },
    fail: function(methodName: string, error: unknown) {
      debug(`${methodName} -> 分享失败`, error)
    },
    cancel: function() {
      cancel && cancel()
    }
  })
}

export default {
  init,
  setDefaultShare
}
