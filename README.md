# 移动端 React 项目

## 说明

此项目基于 [Create React App](https://github.com/facebook/create-react-app) 的 [Fork 版本](https://github.com/yibhou/create-react-app)所搭建。

```bash
npx create-react-app pharos --scripts-version react-scripts-pharos --template cra-template-pwa-typescript
```

为了添加一些新的特性，对 react-scripts 做了部分修改，然后重命名为 [react-scripts-pharos](http://mingjie.ltd:4873/-/web/detail/react-scripts-pharos) 并发布到 NPM 私服。详细修改请看 [Commit 记录](https://github.com/yibhou/create-react-app/commit/c261f5a99bc200c021aa05f1cde43d2b47d8da27)。

### 项目特性

新增特性：

- 添加配置文件 `react.config.js`：允许自定义入口路径、编译路径以及类似 Vue CLI 的 `devServer`、`configureWebpack` 和 `chainWebpack` 字段配置等；
- 支持移动端上 `px` 到 `rem` 的单位转换：使用 `postcss-px2rem-include` 插件自动转换；
- 支持 TypeScript 的模块别名；
- 添加环境变量 `REACT_APP_ENV`：用于区分开发环境、测试环境和生产环境；
- 添加 `lint-staged` 和 `commitlint` 对代码提交规范的检查；

## 兼容性

默认 Create React App 脚手架不兼容 IE10 及以下版本浏览器，如果需要兼容，则必须添加相应的 [polyfills](https://github.com/facebook/create-react-app/tree/master/packages/react-app-polyfill)。

添加兼容 IE9 及以上版本浏览器的 polyfills 如下：

```js
// 必须放在入口文件的顶部
import 'react-app-polyfill/ie9'
import 'react-app-polyfill/stable'
```
