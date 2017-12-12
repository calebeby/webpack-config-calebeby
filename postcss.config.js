const cssStandards = require('spike-css-standards')
const sugarss = require('sugarss')

module.exports = ({ production }) =>
  cssStandards({ parser: sugarss, minify: true })
