const path = require('path')
const fs = require('fs')
const ExtractTextPlugin = require('es6-extract-text-webpack-plugin')
const BabelMinifyPlugin = require('babel-minify-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpack = require('webpack')
const globby = require('globby')

const root = process.cwd()
const src = path.join(root, 'src')

const htmlFiles = globby
  .sync(['*.sgr', '*.html'], { cwd: src })
  .map(f => `./${f}`)

const baseConfig = ({ production }, { input, output, copy = [] }) => {
  const config = {
    devtool: production ? false : 'source-map',
    context: path.resolve(root, 'src'),
    entry: input,
    resolve: { extensions: ['.js', '.sss'] },
    resolveLoader: {
      alias: {
        'babel-loader': require.resolve('babel-loader'),
        'css-loader': require.resolve('css-loader'),
        'postcss-loader': require.resolve('postcss-loader'),
        'file-loader': require.resolve('file-loader'),
        'reshape-loader': require.resolve('reshape-loader')
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
              options: require('./reshape.config')({
                production,
                sugar: false
              })
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
              options: require('./reshape.config')({
                production,
                sugar: true
              })
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.optimize.ModuleConcatenationPlugin(),
      new ExtractTextPlugin('styles.css'),
      new CopyWebpackPlugin(copy)
    ],
    output: {
      path: path.resolve(root, 'build'),
      filename: output
    },
    stats: 'verbose'
  }

  if (production) {
    config.plugins.push(new BabelMinifyPlugin({}, { comments: false }))
  }
  return config
}

module.exports = ({ production }) => {
  const mainConfig = baseConfig(
    { production },
    {
      input: ['./index.js', ...htmlFiles],
      output: 'scripts.js',
      copy: [
        { from: path.join(root, '_redirects') },
        { from: path.join(root, '_headers') },
        {
          from: path.join(root, 'src', 'assets', 'favicon.ico'),
          to: 'favicon.ico'
        },
        { from: path.join(root, 'src', 'assets'), to: 'assets' }
      ]
    }
  )

  const config = [mainConfig]

  if (fs.existsSync(path.resolve(root, 'src', 'sw.js'))) {
    const swConfig = baseConfig(
      { production },
      {
        input: ['./sw.js'],
        output: 'sw.js'
      }
    )
    config.push(swConfig)
  }

  return config
}
