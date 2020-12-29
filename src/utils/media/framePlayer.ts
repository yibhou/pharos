/**
 * canvas逐帧动画播放器
 */

import common from '../common'

type HTMLImageElements = Array<HTMLImageElement>

interface PlayerOptions {
  canvas: HTMLCanvasElement
  width: number
  height: number
  images: string[]
  speedRate?: number
  oncanplay?(): void
  onended?(): void
  onplaying?(playCount: number): void
  onpause?(): void
}
interface PlayerEvents {
  oncanplay(): void
  onended(): void
  onplaying(playCount: number): void
  onpause(): void
}

interface PlayerInterface {
  play(): void
  pause(): void
}
interface PlayerConstructor {
  new(options: PlayerOptions): PlayerInterface
}

const FramePlayer: PlayerConstructor = class FramePlayer implements PlayerInterface {
  protected played = false // 是否为播放状态
  private resLoaded = false // 资源加载完毕
  private loadedImages: HTMLImageElements = [] // 加载完成的图片dom数组
  private playCount = 0 // 轮播图片计数器
  private cycleCount = 0 // 循环渲染每一帧计数器
  private cycleMaxCount = 1 // 循环渲染最大次数
  private frameId: number = 0

  private canvas
  private width
  private height
  private images
  private speedRate
  private events: PlayerEvents
  readonly devicePixelRatio

  constructor(public options: PlayerOptions) {
    // canvas元素
    this.canvas = options.canvas
    // canvas宽度
    this.width = options.width
    // canvas高度
    this.height = options.height
    // 待播放的图片数据
    this.images = options.images
    // 播放速率
    this.speedRate = options.speedRate ?? 250
    // 事件
    this.events = {
      // 可否播放事件
      oncanplay: options.oncanplay ?? function() {},
      // 播放结束事件
      onended: options.onended ?? function() {},
      // 正在播放事件
      onplaying: options.onplaying ?? function() {},
      // 暂停播放事件
      onpause: options.onpause ?? function() {}
    }
    // 处理canvas
    this.devicePixelRatio = window.devicePixelRatio
    this.canvas.width = (this.width ?? this.canvas.clientWidth) * this.devicePixelRatio
    this.canvas.height = (this.height ?? this.canvas.clientHeight) * this.devicePixelRatio
    // 预加载图片
    this.preload()
  }

  /**
   * 开始播放
   */
  play() {
    if (!this.played) {
      if (this.resLoaded === false) {
        this.preload().then(() => {
          this.play()
        })
      } else {
        this.played = true
        this.setAnimationFrame()
      }
    }
  }
  /**
   * 暂停播放
   */
  pause() {
    this.played = false
    this.events.onpause()
  }

  preload() {
    return loadImages(this.images).then(loadedImages => {
      // 资源加载完成后只触发一次oncanplay事件
      if (this.resLoaded === false) {
        this.resLoaded = true
        this.loadedImages = loadedImages
        this.events.oncanplay()
      } else {
        this.resLoaded = true
      }
    })
  }
  setAnimationFrame(this: FramePlayer) {
    const loop = () => {
      this.frameId = window.requestAnimationFrame(() => {
        this.progress(loop)
      })
    }
    loop()
  }
  /**
   * 进度控制
   */
  async progress(done: () => void) {
    const len = this.loadedImages.length
    // 判断是否播放结束
    const isEnded = this.playCount === len

    if (isEnded) {
      // 处理播放结束逻辑
      this.endedHandler()
    } else {
      if (this.played) {
        const image = this.loadedImages[this.playCount]
        // 将图片渲染到canvas
        this.render(image)
        this.events.onplaying(this.playCount)

        this.cycleCount++
        if (this.cycleCount === this.cycleMaxCount) {
          this.cycleCount = 0
          this.playCount++
        }
        await delay(this.speedRate)
        done()
      }
    }
  }
  /**
   * 处理播放结束
   */
  endedHandler() {
    this.played = false
    this.playCount = 0
    this.events.onended()
  }
  /**
   * 渲染canvas
   */
  render(image: HTMLImageElement) {
    const w = image.width,
      h = image.height,
      W = this.canvas.width,
      H = this.canvas.height

    const Ww = W / w,
      Hh = H / h

    let sx: unknown, sy: unknown
    let sWidth: number, sHeight: number
    const dx = 0,
      dy = 0,
      dWidth = W,
      dHeight = H
    const calc1 = () => {
      sx = 0
      sy = (h - H / Ww) / 2
      sWidth = w
      sHeight = H / Ww
    }
    const calc2 = () => {
      sx = (w - W / Hh) / 2
      sy = 0
      sWidth = W / Hh
      sHeight = h
    }
    if ((w > W && h > H) || (w < W && h < H)) {
      Ww > Hh ? calc1() : calc2()
    } else {
      w > W ? calc1() : calc2()
    }
    const ctx = this.canvas.getContext('2d')!
    // 擦除画布
    ctx.clearRect(0, 0, dWidth, dHeight)
    // 绘制图片
    ctx.drawImage(image, sx as number, sy as number, sWidth!, sHeight!, dx, dy, dWidth, dHeight)
  }
}

function delay(milliseconds: number) {
  return new Promise<void>(resolve => {
    setTimeout(() => {
      resolve()
    }, milliseconds)
  })
}
function loadImages(images: string[]) {
  return new Promise<HTMLImageElements>(resolve => {
    const loadedImages: HTMLImageElements = []
    common.loadImages(images, (num: number, len: number, isComplete: boolean, i: number, image: HTMLImageElement) => {
      loadedImages[i] = image
      if (isComplete) {
        resolve(loadedImages)
      }
    })
  })
}

export default FramePlayer
