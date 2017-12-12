const path = require('path')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const globby = require('globby')

const root = process.cwd()
const src = path.join(root, 'src')

module.exports = ({ production }) => {
  const config = {
    devtool: production ? false : 'source-map',
    entry: [
      './index.js',
      ...globby.sync(['*.sgr', '*.html'], { cwd: src }).map(f => `./${f}`)
    ],
    context: path.resolve(root, 'src'),
    resolve: {
      extensions: ['.js', '.sss']
    },
    resolveLoader: {
      alias: {
        'babel-loader': require.resolve('babel-loader'),
        'css-loader': require.resolve('css-loader'),
        'postcss-loader': require.resolve('postcss-loader'),
        'file-loader': require.resolve('file-loader'),
        'reshape-loader': require.resolve('reshape-loader'),
      }
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: 'babel-loader',
          options: require('./babel.config')({ production })
        },
        {
          test: /\.sss$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'css-loader',
                options: {
                  modules: true,
                  localIdentName: '[local]-[hash:base64:4]',
                  camelCase: true
                }
              },
              {
                loader: 'postcss-loader',
                options: require('./postcss.config')({ production })
              }
            ]
          })
        },
        {
          test: /\.html$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].html'
              }
            },
            {
              loader: 'reshape-loader',
              options: require('./reshape.config')({ production, sugar: false })
            }
          ]
        },
        {
          test: /\.sgr$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[name].html'
              }
            },
            {
              loader: 'reshape-loader',
              options: require('./reshape.config')({ production, sugar: true })
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ExtractTextPlugin('styles.css'),
      new CopyWebpackPlugin([
        { from: path.join(root, '_redirects') },
        { from: path.join(root, '_headers') },
        {
          from: path.join(root, 'src', 'assets', 'favicon.ico'),
          to: 'favicon.ico'
        },
        { from: path.join(root, 'src', 'assets'), to: 'assets' }
      ])
    ],
    output: {
      path: path.resolve(root, 'build'),
      filename: 'scripts.js'
    },
    stats: 'verbose'
  }
  if (production) {
    config.plugins.push(new BabelMinifyPlugin({}, { comments: false }))
  }
  return config
}
