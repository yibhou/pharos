const fs = require('fs')

const resolve = path => require('path').join(__dirname, path)
const isHttps = process.env.HTTPS === 'true'

module.exports = {
  outputDir: process.env.REACT_APP_ENV && `dist/app-${process.env.REACT_APP_ENV}`,
  appIndexJs: 'src/index',
  appHtml: 'public/index.html',
  publicPath: process.env.REACT_APP_ENV !== 'development' && './',
  productionSourceMap: 'source-map',
  devServer: {
    host: '0.0.0.0',
    port: 9000,
    https: isHttps && {
      ca: fs.readFileSync('build/cert/ca.crt'),
      key: fs.readFileSync('build/cert/server.key'),
      cert: fs.readFileSync('build/cert/server.crt')
    },
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',
        ws: true,
        secure: false,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  configureWebpack: config => {},
  chainWebpack: config => {
    config.resolve.alias
      .set('@', resolve('src'))
  }
}
