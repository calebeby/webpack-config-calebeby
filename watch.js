const webpack = require('webpack')
const printStats = require('./print-stats')

const browserSync = require('browser-sync').create()
const singlePageMiddleware = require('connect-history-api-fallback')

const watch = env => {
  const webpackConfig = require('./webpack.config')(env)
  const compiler = webpack(webpackConfig)

  compiler.watch({}, printStats)

  browserSync.init({
    server: 'build',
    middleware: [singlePageMiddleware()],
    reloadOnRestart: true,
    logPrefix: 'BS',
    files: 'build/*',
    cors: true
  })
}

module.exports = watch
