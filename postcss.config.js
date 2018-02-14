const cssStandards = require('spike-css-standards')
const sugarss = require('sugarss')
const vars = require('postcss-css-variables')
const calc = require('postcss-calc')
const browsers = require('./browserlist.config')

module.exports = ({ production }) =>
  cssStandards({
    parser: sugarss,
    minify: true,
    appendPlugins: [vars, calc],
    autoprefixer: browsers,
    cssnano: { zindex: false }
  })
