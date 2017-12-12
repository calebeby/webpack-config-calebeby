const webpack = require('webpack')
const printStats = require('./print-stats')

const build = env => {
  const webpackConfig = require('./webpack.config')(env)
  const compiler = webpack(webpackConfig)
  compiler.run(printStats)
}

module.exports = build
