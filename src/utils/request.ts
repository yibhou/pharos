/**
 * 统一接口请求工具
 */

import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig
} from 'axios'

type Response<T> = AxiosResponse<T> & { json: T }

let instance: AxiosInstance

// 请求拦截器
axios.interceptors.request.use(config => {
  return config
}, error => {
  return Promise.reject(error)
})

// 响应拦截器
axios.interceptors.response.use(response => {
  const json = response.data

  switch (json?.errcode) {
    case '3001': // 访问票据过期
      break
  }
  return response
}, error => {
  return Promise.reject(error)
})

function getAuthentication() {

}

// 创建axios实例对象
function create(config: AxiosRequestConfig = {}) {
  return instance = axios.create(Object.assign({
    baseURL: '',
    timeout: 5000, // 接口超时时长 0=不超时
    headers: {
      // post: {
      //   'Content-Type': 'application/json'
      // }
    }
  }, config))
}

export function getJSON<T = any>(url: string, params: { [key: string]: unknown } = {}, config: AxiosRequestConfig = {}) {
  config.params = Object.assign(params, getAuthentication())
  return instance.get<T, Response<T>>(url, config).then(response => {
    response.json = response.data
    return Promise.resolve(response)
  }).catch(error => {
    return Promise.reject(error)
  })
}

export function postJSON<T = any>(url: string, data: unknown = {}, config: AxiosRequestConfig = {}) {
  data = Object.assign(data, getAuthentication())
  return instance.post<T, Response<T>>(url, data, config).then(response => {
    response.json = response.data
    return Promise.resolve(response)
  }, error => {
    return Promise.reject(error)
  })
}

export default {
  // @ts-ignore
  instance,
  create
}
