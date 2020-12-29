/**
 * 接口请求
 * Usage:
 *   import { Request } from '@app/utils/request.enhance'
 *   Request.get(url, data)
 *   Request.post(url, data)
 *   Request(options).post(url, data, config)
 */

// import { Toast } from 'vant'
import type {
  AxiosResponse,
  AxiosRequestConfig
} from 'axios'

import { getJSON, postJSON } from '@/utils/request'

type Response<T> = AxiosResponse<T> & { json: T }
type ResponsePromise<T> = Promise<Response<T>>

// loading 配置对象
interface LoadingOptions {}

// 请求器配置对象
type RequestOptions = Partial<{
  isLog: boolean
  isShowError: boolean
  loadingOptions: LoadingOptions
  errorFilter: (json?: any) => { status: unknown, message: unknown } | undefined
}>

// 请求处理器
interface RequestHandler<T> {
  /**
   * GET 请求方法
   * @param url 请求地址
   * @param data 请求参数
   * @param config Axios 配置对象
   * @returns 响应 Promise 对象
   */
  get: <U = T>(url: string, data?: { [key: string]: unknown }, config?: AxiosRequestConfig) => ResponsePromise<U>
  /**
   * POST 请求方法
   * @param url 请求地址
   * @param data 请求参数
   * @param config Axios 配置对象
   * @returns 响应 Promise 对象
   */
  post: <U = T>(url: string, data?: unknown, config?: AxiosRequestConfig) => ResponsePromise<U>
  /**
   * loading 处理
   * @param loadingOptions loading 配置
   * @returns 请求处理器
   */
  loading: (loadingOptions?: LoadingOptions) => RequestHandler<T>
}

// T[K] 所定义方法的参数列表
type PickParameters<T, K extends keyof T> = {
  [P in K]: T[P] extends (...args: any) => any ? Parameters<T[P]> : never
}[K]
// RequestHandler<T>[K] 所定义方法的参数列表
type PickRequestHandlerParameters<T, K extends keyof RequestHandler<T>> = PickParameters<RequestHandler<T>, K>

// 请求器扩展
interface RequestExtend extends RequestHandler<any> {
  /**
   * Request
   * @param options Request 配置对象
   * @returns 请求处理器
   */
  <T>(options?: RequestOptions): RequestHandler<T>
}

// const log = require('@/utils/debug.log')('request')

// 记录和显示错误
function errorLog(error: Error) {
  // log(error)
  console.log(error)
}

// 错误码
const enum Status {
  NETWORK_ERROR,
  SERVICE_ERROR = -200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  REQUEST_TIMEOUT = 408,
  INTERNAL_SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
  GATEWAY_TIMEOUT = 504,
  HTTP_VERSION_NOT_SUPPORTED = 505
}

// 返回错误码对应的错误消息
function errorMsg(status: Status) {
  const message = ({
    [Status.NETWORK_ERROR]: '网络异常',
    [Status.SERVICE_ERROR]: '服务异常',
    [Status.BAD_REQUEST]: '请求错误',
    [Status.UNAUTHORIZED]: '未授权，请登录',
    [Status.FORBIDDEN]: '拒绝访问',
    [Status.NOT_FOUND]: '请求地址出错',
    [Status.REQUEST_TIMEOUT]: '请求超时',
    [Status.INTERNAL_SERVER_ERROR]: '服务器内部错误',
    [Status.NOT_IMPLEMENTED]: '服务未实现',
    [Status.BAD_GATEWAY]: '网关错误',
    [Status.SERVICE_UNAVAILABLE]: '服务不可用',
    [Status.GATEWAY_TIMEOUT]: '网关超时',
    [Status.HTTP_VERSION_NOT_SUPPORTED]: 'HTTP版本不受支持'
  })[status]
  return message ?? ''
}

// 转换Error对象 记录错误日志
function errorWorker(raw: any): Error {
  const e = Object.assign(new Error(), raw)
  let status = e.isAxiosError ? Status.NETWORK_ERROR : Status.SERVICE_ERROR // 默认fallback错误码
  const url = e.isAxiosError ? e.config.url : e.response.config.url

  if (e.isAxiosError) {
    e.status = e.status || e.request.status // 请求状态码
    // 界面提示的错误信息
    // 优先级为匹配错误消息 > 原始错误消息 > 默认错误消息
    e.$message = errorMsg(e.status) || e.message || errorMsg(status)
    // 根据状态码对错误消息特殊处理
    switch (e.status) {
      case 0:
        if (e.message.indexOf('timeout') !== -1) { // 请求超时
          e.$message = errorMsg(status = Status.REQUEST_TIMEOUT)
        }
        break
    }
  } else {
    // 优先级为原始错误消息 > 匹配错误消息 > 默认错误消息
    e.$message = e.message || errorMsg(e.status) || errorMsg(status)
    switch (e.status) {
      case '4001':
        break
    }
  }
  // Error对象错误信息
  e.message = `[${e.status || status}] ${e.$message} ${url}`
  return e
}

/**
 * 业务错误过滤器 返回对象必须有 status 和 message 两个属性
 */
function businessErrorFilter(json: any) {
  if (json?.errcode !== '0') {
    return {
      status: json.errcode,
      message: json.errmsg
    }
  }
}

/**
 * 跟踪接口请求的每个关键时刻
 */
export function trace<T = any>(request: ResponsePromise<T>, {
  onbefore = () => {}, // 请求开始
  onerror = (e: Error): void => {}, // 请求错误
  onsuccess = (response: Response<T>): void => {}, // 请求成功
  onafter = () => {}, // 请求结束
  errorFilter = businessErrorFilter// 错误响应过滤器
} = {}) {
  const start = new Date().getTime()
  const spend = () => new Date().getTime() - start // 计算请求耗时

  onbefore.call(request)
  return request.then(response => {
    // 错误响应过滤
    const result = errorFilter(response.json)
    if (result) {
      const raw = Object.assign(result, {
        response,
        timestamp: spend() // 请求耗时时间戳
      })
      onerror.call(request, errorWorker(raw))
    } else {
      onsuccess.call(request, response)
    }
    return Promise.resolve(response)
  }).catch(error => {
    const response = error.response ?? {}
    const raw = Object.assign({}, error, {
      status: response.status, // 错误码
      message: error.message, // 错误消息
      response,
      timestamp: spend() // 请求耗时时间戳
    })
    onerror.call(request, errorWorker(raw))
    return Promise.reject(error)
  }).finally(() => {
    onafter.call(request)
  })
}

let loadingTimer: number // 关闭loading定时器
let loadingToast: any

export function enhance<T = any>(request: ResponsePromise<T>, {
  isLog = true, // 是否记录日志
  isShowError = true, // 是否提示错误消息
  loadingOptions, // loading自定义配置项 true为默认loading false为不使用loading
  errorFilter = businessErrorFilter // 错误响应过滤器
}: RequestOptions = {}) {
  if (loadingOptions) {
    clearTimeout(loadingTimer)
    // loading加载中
    // if (loadingToast == null) {
    //   loadingToast = Toast.loading(Object.assign({
    //     message: '',
    //     loadingType: 'circular',
    //     forbidClick: true,
    //     duration: 0
    //   }, loadingOptions))
    // }
  }
  return trace(request, {
    onerror(e) {
      if (isLog) {
        errorLog(e) // 记录错误日志
      }
      if (isShowError) {
        // 这里写展示错误消息逻辑
      }
    },
    onafter() {
      loadingTimer = window.setTimeout(() => {
        // 关闭loading加载中
        if (loadingToast) {
          loadingToast.clear()
          loadingToast = null
        }
      }, 250)
    },
    errorFilter
  })
}

/**
 * 请求器 支持链式操作
 * @param options 请求器配置对象
 * @returns 请求处理器
 */
function baseRequest<T = any>(options?: RequestOptions) {
  const handler: RequestHandler<T> = {
    get: (url, data, config) => enhance(getJSON(url, data, config), options),
    post: (url, data, config) => enhance(postJSON(url, data, config), options),
    loading(loadingOptions) {
      Object.assign({}, options, {
        // 将loading配置项并入options配置 不存在则使用默认loading
        loadingOptions: loadingOptions ?? true
      })
      return this
    }
  }
  return handler
}

export const Request: RequestExtend = Object.assign(baseRequest as RequestExtend, {
  get<T>(...args: PickRequestHandlerParameters<T, 'get'>) {
    return baseRequest().get.apply(null, args)
  },
  post<T>(...args: PickRequestHandlerParameters<T, 'post'>) {
    return baseRequest().post.apply(null, args)
  },
  loading(loadingOptions?: LoadingOptions) {
    return baseRequest<any>().loading(loadingOptions)
  }
})
