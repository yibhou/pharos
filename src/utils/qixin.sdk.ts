/**
 * 企信sdk入口
 *
 * 使用sdk之前必须引入js：
 * <script src="<%= BASE_URL %>static/common/scripts/eimMobileJsSdk-2.1.0.js"></script>
 */

let qxsdk: any

if (typeof EimMobileJsSdk !== 'undefined') {
  qxsdk = new window.EimMobileJsSdk('new')
}

export default {
  /**
   * 获取企信用户信息
   * 本地开发需要开启调试模式：url参数带test=1
   */
  getUserInfo() {
    const match = window.location.search.match(/openId=(\w+)/)
    const match1 = window.location.search.match(/test=(\w+)/)
    const match2 = window.location.search.match(/userId=(\w+)/)
    const match3 = window.location.search.match(/name=([^&]+)/)
    const isTest = match1 && match1[1] === '1' // 是否本地测试

    // 本地测试使用的数据 当url参数带test=1时会使用
    const userInfo = {
      openId: match ? match[1] : null,
      userId: match2 ? match2[1] : 'admin',
      qxUserId: '',
      avatar: '',
      department: '技术事业部',
      nickName: match3 ? match3[1] : '章俊凤'
    }
    // 当url参数为test=1时 返回测试数据
    if (isTest) {
      return Promise.resolve(userInfo)
    } else {
      return this.showUserInfo().then(data => {
        data = JSON.parse(decodeURIComponent(data))
        const newUser = data.EIM.newUser
        console.log(newUser)

        userInfo.qxUserId = newUser.userid
        userInfo.avatar = newUser.useravatar
        userInfo.department = newUser.userdapartment
        userInfo.nickName = newUser.username
        return userInfo
      }).catch(error => {
        console.log('获取企信用户信息异常：' + error)
      })
    }
  },
  /**
   * 获取当前登录企信的用户基本信息
   */
  showUserInfo() {
    return new Promise<any>((resolve, reject) => {
      qxsdk.showUserInfo({
        id: 'mine',
        success: (data: unknown) => resolve(data),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 强制横竖屏
   * 存在问题：iOS系统下不能强制横屏
   */
  screenRotation({
    param = 'vertical' // 强制横竖屏 vertical=竖屏 horizontal=横屏
  } = {}) {
    return new Promise<any>((resolve, reject) => {
      qxsdk.screenRotation({
        param,
        success: (data: unknown) => resolve(data),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 打开通讯录选人
   */
  selectUser({
    maxLimit = 99, // 可以勾选的人数限制 最多99人
    selecteduids = [], // 回传已勾选的userid数组
    ignoreself = false // 不勾选自己
  } = {}) {
    return new Promise<any>((resolve, reject) => {
      qxsdk.selectUser({
        id: 'mine',
        ignoreself,
        selecteduids,
        maxLimit,
        success: (data: string) => resolve(JSON.parse(decodeURIComponent(data))),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 拍照、选图裁剪上传返回url
   */
  imcropUpload({
    aspectratio = 1 // 裁剪图片的横纵比例
  } = {}) {
    return new Promise<string>((resolve, reject) => {
      qxsdk.imcropUpload({
        id: 'mine',
        aspectratio,
        success: (url: string) => resolve(url),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 发送通知给指定的用户（确认赠卡）
   */
  sendCardToUser({
    userid = '', // 接收者ID
    from = '', // 发送者昵称
    title = '', // 标题
    des = '', // 描述
    cover = '', // 封面图 图片大小15k以内
    link = '' // 页面链接
  } = {}) {
    return new Promise<any>((resolve, reject) => {
      qxsdk.sendCardToUser({
        id: 'mine',
        userid,
        from,
        title,
        des,
        cover,
        link,
        success: (data: unknown) => resolve(data),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 发送通知给选择的用户或者群/讨论组（赠卡、求卡）
   */
  sendCardToChat({
    from = '', // 发送消息来源
    title = '', // 标题
    des = '', // 描述
    cover = '', // 封面图片地址 图片大小15k以内
    link = '' // 赠卡或求卡回调url
  } = {}) {
    return new Promise<any>((resolve, reject) => {
      qxsdk.sendCardToChat({
        id: 'mine',
        from,
        title,
        des,
        cover,
        link,
        success: (data: unknown) => resolve(data),
        fail: (error: unknown) => reject(error)
      })
    })
  },
  /**
   * 关闭视图
   */
  closeWindow() {
    qxsdk.closeWindow()
  }
}
