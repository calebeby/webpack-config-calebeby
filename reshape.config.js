const sugarml = require('sugarml')
const minify = require('reshape-minify')

module.exports = ({ production, sugar }) => ({
  parser: sugar ? sugarml : undefined,
  plugins: [minify()],
  locals: {}
})
