module.exports = {
  plugins: [
    require('postcss-flexbugs-fixes'),
    require('postcss-preset-env')({
      autoprefixer: {
        flexbox: 'no-2009'
      },
      stage: 3
    }),
    require('postcss-normalize')(),
    require('postcss-px2rem-include')({
      remUnit: 37.5,
      include: /(node_modules\/@?vant)|src/
    })
  ]
}
