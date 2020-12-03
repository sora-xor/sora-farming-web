/* eslint-disable */
const { execSync } = require('child_process')
const package = require('./package.json')

const rules = []

module.exports = {
  chainWebpack: config => {
    config.plugin('define').tap(args => {
      args[0]['process.env.SORA_FARM_PACKAGE_VERSION'] = JSON.stringify(package.version)
      args[0]['process.env.SORA_FARM_COMMIT_HASH'] = JSON.stringify(execSync('git rev-parse HEAD').toString().trim())
      args[0]['process.env.SORA_FARM_COMMIT_HASH_SHORT'] = JSON.stringify(execSync('git rev-parse --short HEAD').toString().trim())
      return args
    })

    return config
  },
  configureWebpack: {
    module: {
      rules: rules
    }
  }
}