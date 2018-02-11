const webpack = require('webpack')
const printStats = require('./print-stats')

const build = env => {
  const webpackConfig = require('./webpack.config')(env)
  const compiler = webpack(webpackConfig)
  compiler.run(printStats)
  if (env.electron) {
    const mainCompiler = webpack(webpackConfig.electron)
    mainCompiler.run(printStats)
  }
}

module.exports = build
