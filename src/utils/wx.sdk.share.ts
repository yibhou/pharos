/* eslint-disable no-undef, no-console */

/**
 * 微信分享
 */
import wx from 'weixin-js-sdk-ts'
import type { ShareData } from '@/types/utils'

interface DefaultShareOptions {
  supportedApiMap: { [api: string]: boolean }
  data: ShareData
  trigger?(methodName?: string): void
  success?(methodName?: string): void
  fail?(error: unknown, methodName?: string): void
  cancel?(): void
}

type ShareApiMethod = Extract<wx.ApiMethod, 'updateAppMessageShareData' | 'updateTimelineShareData' | 'onMenuShareAppMessage' | 'onMenuShareTimeline'>
type ShareOptions = { methodName: ShareApiMethod } & Omit<DefaultShareOptions, 'supportedApiMap'>

/**
 * 检测客户端支持的分享API并设置微信分享
 * @param {Object} supportedApiMap 支持的微信API集合
 * @param {Object} data 分享数据
 */
function setDefaultShare({
  supportedApiMap,
  data,
  trigger,
  success,
  fail,
  cancel
}: DefaultShareOptions) {
  const options = {
    data,
    trigger,
    success,
    fail,
    cancel
  } as ShareOptions
  // 分享给朋友
  if (supportedApiMap['updateAppMessageShareData']) {
    options.methodName = 'updateAppMessageShareData'
    // data参数为title,desc,link,imgUrl
    share(options)
  } else if (supportedApiMap['onMenuShareAppMessage']) {
    // 分享给朋友 即将废弃
    options.methodName = 'onMenuShareAppMessage'
    options.data = Object.assign({
      type: '', // 分享类型music、video或link 不填默认为link
      dataUrl: '' // type为music或video的数据链接 默认为空
    }, options.data)
    // data参数为title,desc,link,imgUrl,type,dataUrl
    share(options)
  }
  // 分享到朋友圈
  if (supportedApiMap['updateTimelineShareData']) {
    options.methodName = 'updateTimelineShareData'
    // data参数为title,link,imgUrl
    share(options)
  } else if (supportedApiMap['onMenuShareTimeline']) {
    // 分享到朋友圈 即将废弃
    options.methodName = 'onMenuShareTimeline'
    // data参数为title,link,imgUrl
    share(options)
  }
}

/**
 * @param {String} methodName 分享方法
 * @param {Object} data 分享数据
 * @param {Function} trigger 分享触发事件
 * @param {Function} success 分享成功事件
 * @param {Function} fail 分享失败事件
 */
function share({
  methodName,
  data,
  trigger,
  success,
  fail,
  cancel
}: ShareOptions) {
  const { title, desc = '', link, imgUrl } = data
  wx[methodName]({
    title,
    desc,
    link,
    imgUrl,
    complete: function() {
      trigger && trigger(methodName)
    },
    success: function() {
      success && success(methodName)
    },
    fail: function(error: unknown) {
      fail && fail(error, methodName)
    },
    cancel: function() {
      cancel && cancel()
    }
  })
}

export default {
  setDefaultShare
}
