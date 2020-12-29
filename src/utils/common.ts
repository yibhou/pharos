/**
 * 常用工具库
 */

import axios from 'axios'
import html2canvas from 'html2canvas'
import EXIF from 'exif-js'

export default {
  /**
   * 图片预加载
   */
  loadImages(images: string[], callback: (num: number, len: number, isComplete: boolean, i: number, image: HTMLImageElement) => void) {
    const len = images.length
    let num = 0
    const complete = function(i: number, image: HTMLImageElement) {
      num++
      /**
       * 返回参数
       * num 已加载数
       * len 总数
       * isComplete 是否加载完成
       * i 图片索引
       * image 图片对象
       */
      callback && callback(num, len, num === len, i, image)
    }

    for (let i = 0; i < len; i++) {
      const image = new Image()
      image.src = images[i]
      if (image.complete) {
        complete(i, image)
        continue
      }
      image.onload = function() {
        complete(i, this as HTMLImageElement)
        this.onload = null
      }
    }
  },
  /**
   * html元素转换为图片的dataURL
   */
  html2image(element: HTMLElement) {
    return html2canvas(element, {
      useCORS: true,
      logging: true,
      scale: window.devicePixelRatio,
      imageTimeout: 0, // 0=图片加载无超时时长
      backgroundColor: null // transparent=透明背景
    }).then(canvas => {
      const dataURL = canvas.toDataURL('image/png')
      return dataURL
    })
  },
  /**
   * url地址转换为图片元素
   */
  url2image(url: string) {
    return new Promise<HTMLImageElement>(resolve => {
      const image = new Image()
      image.src = url
      image.crossOrigin = 'anonymous'
      image.onload = () => {
        resolve(image)
      }
    })
  },
  /**
   * dataURL转换为图片元素
   */
  dataURL2image(dataURL: string) {
    return new Promise<HTMLImageElement>(resolve => {
      const image = new Image()
      image.src = dataURL
      image.onload = () => {
        resolve(image)
      }
    })
  },
  /**
   * 图片元素转换为canvas元素
   */
  image2canvas(image: HTMLImageElement, canvas: HTMLCanvasElement) {
    let w = image.width
    let h = image.height

    if (canvas) {
      w = canvas.width
      h = canvas.height
    } else {
      canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
    }
    canvas.getContext('2d')!.drawImage(image, 0, 0, w, h)
  },
  /**
   * canvas元素转为为图片blob
   */
  canvas2image(canvas: HTMLCanvasElement, quality: number) {
    return new Promise<Blob | null>(resolve => {
      canvas.toBlob(blob => {
        resolve(blob)
      }, 'image/jpeg', quality || 1)
    })
  },
  /**
   * canvas元素转换为图片dataURL
   */
  canvas2dataURL(canvas: HTMLCanvasElement, quality: number) {
    return canvas.toDataURL('image/png', quality)
  },
  /**
   * 读取文件的dataURL
   */
  file2dataURL(file: File) {
    return new Promise<string>(resolve => {
      const reader = new FileReader()
      reader.onloadend = e => {
        const dataURL = e.target?.result
        resolve(dataURL as string)
      }
      reader.readAsDataURL(file)
    })
  },
  /**
   * 读取文件的ArrayBuffer
   */
  file2arrayBuffer(file: File) {
    return new Promise<ArrayBuffer>(resolve => {
      const reader = new FileReader()
      reader.onloadend = e => {
        const arrayBuffer = e.target?.result
        resolve(arrayBuffer as ArrayBuffer)
      }
      reader.readAsArrayBuffer(file)
    })
  },
  /**
   * dataURL转换为blob
   */
  dataURL2blob(dataURL: string) {
    const array = dataURL.split(',')
    const mimeType = array[0].match(/:(.*?);/)![1]
    const decoded = window.atob(array[1]) // 解码
    let len = decoded.length
    const uint8array = new Uint8Array(len)
    while (len--) {
      uint8array[len] = decoded.charCodeAt(len)
    }
    return new Blob([uint8array], {
      type: mimeType
    })
  },
  /**
   * dataURL转换为file
   */
  async dataURL2file(dataURL: string) {
    const blob = await this.dataURL2blob(dataURL)
    return new File([blob], 'image.jpg', {
      type: 'image/jpeg'
    })
  },

  /**
   * 通过file获取拍照图片的方向
   */
  async getOrientation(file: File) {
    const arrayBuffer = await this.file2arrayBuffer(file)
    const exif = EXIF.readFromBinaryFile(arrayBuffer)
    return exif.Orientation
  },
  /**
   * 通过图片元素获取拍照图片的方向
   */
  getImageOrientation(image: HTMLImageElement) {
    return new Promise(resolve => {
      EXIF.getData(image as any, function(this: any) {
        resolve(EXIF.getTag(this, 'Orientation'))
      })
    })
  },
  /**
   * 压缩图片质量
   */
  compressImage(image: HTMLImageElement) {
    let width = image.width
    let height = image.height
    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')!
    let ratio = Math.sqrt(width * height / 2000000) // 压缩率——图片大小压缩至200万像素以下

    ratio = ratio > 1 ? ratio : 1

    width /= ratio
    height /= ratio
    canvas.width = width
    canvas.height = height
    // context.fillStyle = '#fff';
    // context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height)
    return canvas
  },

  /**
   * 获取远程文件的dataURL
   */
  getFile2dataURL(url: string) {
    return axios.get(url, {
      responseType: 'blob',
      withCredentials: false
    }).then(response => {
      return new Promise<string>(resolve => {
        const blob = response.data
        const fileReader = new FileReader()
        fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
          const dataURL = e.target?.result
          resolve(dataURL as string)
        }
        fileReader.readAsDataURL(blob)
      })
    })
  },
  /**
   * 获取远程文件的objectURL
   */
  getFile2objectURL(url: string) {
    return new Promise<string>(resolve => {
      const xhr = new XMLHttpRequest()
      xhr.open('get', url, true)
      xhr.responseType = 'blob'
      xhr.onload = function() {
        if (this.status === 200) {
          const blob = this.response
          // blob转base64
          const fileReader = new FileReader()
          fileReader.onloadend = (e: ProgressEvent<FileReader>) => {
            const dataURL = e.target?.result
            resolve(dataURL as string)
          }
          fileReader.readAsDataURL(blob)
          // blob转image
          window.URL = window.URL || window.webkitURL
          const image = document.createElement('img')
          image.src = window.URL.createObjectURL(blob)
          image.onload = () => {
            window.URL.revokeObjectURL(image.src)
          }
          document.body.appendChild(image)
        }
      }
      xhr.send()
    })
  }
}
