const path = require('path')

const resolve = dir => {
  return path.join(__dirname, dir)
}

module.exports = {
    //baseUrl: 'wxrobot-admin',
    chainWebpack: config => {
        config.resolve.alias
            .set('@', resolve('src')) // key,value自行定义，比如.set('@@', resolve('src/components'))
            .set('_c', resolve('src/components'))
    }
}