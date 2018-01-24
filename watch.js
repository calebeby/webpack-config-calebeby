const webpack = require('webpack')
const printStats = require('./print-stats')

const path = require('path')
const { spawn } = require('child_process')

const browserSync = require('browser-sync').create()
const singlePageMiddleware = require('connect-history-api-fallback')

const watch = env => {
  const webpackConfig = require('./webpack.config')(env)
  const compiler = webpack(webpackConfig)

  compiler.watch({}, printStats)

  if (env.electron) {
    spawn(require('electron').toString(), [
      path.join(process.cwd(), 'build', 'main.js')
    ])
  }

  browserSync.init({
    server: 'build',
    middleware: [singlePageMiddleware()],
    reloadOnRestart: true,
    logPrefix: 'BS',
    files: 'build/*',
    cors: true,
    open: !env.electron
  })
}

module.exports = watch
