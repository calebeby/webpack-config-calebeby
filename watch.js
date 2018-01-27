const webpack = require('webpack')
const printStats = require('./print-stats')

const path = require('path')
const { spawn } = require('child_process')

const browserSync = require('browser-sync').create()
const singlePageMiddleware = require('connect-history-api-fallback')

const watch = env => {
  const webpackConfig = require('./webpack.config')(env)
  const compiler = webpack(webpackConfig)
  let electronProc

  if (env.electron) {
    const mainCompiler = webpack(webpackConfig.electron)
    mainCompiler.watch({}, (err, s) => {
      electronProc && electronProc.kill()
      electronProc = spawn(require('electron').toString(), [
        path.join(process.cwd(), 'build', 'main.js')
      ])
      electronProc.stderr.pipe(process.stderr)
      electronProc.stdout.pipe(process.stdout)
      printStats(err, s)
    })
  }

  compiler.watch({}, printStats)

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
