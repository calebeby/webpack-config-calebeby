const prettyBytes = require('pretty-bytes')
const chalk = require('chalk')
const symbols = require('log-symbols')

const printStats = (err, s) => {
  const stats = s.toJson()
  if (s.hasErrors()) {
    const output = stats.errors.reduce((out, error) => {
      const [filename, ...rest] = error.split('\n')
      return (
        out +
        `${symbols.error} ${chalk.bold(filename)}
${rest.join('\n')}
`
      )
    }, '')
    console.log(output)
  }
  require('fs').writeFileSync('stats.json', JSON.stringify(stats))
  const output = stats.assets.reduce((out, asset) => {
    const size = asset.isOverSizeLimit
      ? chalk.keyword('orange')(prettyBytes(asset.size))
      : prettyBytes(asset.size)
    const chunks =
      asset.chunkNames.length >= 1 ? JSON.stringify(asset.chunkNames) : ''
    return (
      out +
      `
${chalk.bold(size)} ${asset.name} ${chunks}`
    )
  }, '')
  console.log(output)

  require('fs').writeFileSync('stats.json', JSON.stringify(stats))
}

module.exports = printStats
