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

const baseConfig = (
  { production, electron },
  { input, output, copy = [], target }
) => {
  const config = {
    devtool: production ? false : 'source-map',
    target: target || electron ? 'electron-renderer' : 'web',
    context: path.resolve(root, 'src'),
    entry: input,
    resolve: { extensions: ['.js', '.sss', '.ts', '.tsx'] },
    resolveLoader: {
      alias: {
        'babel-loader': require.resolve('babel-loader'),
        'typings-for-css-modules-loader': require.resolve(
          'typings-for-css-modules-loader'
        ),
        'postcss-loader': require.resolve('postcss-loader'),
        'file-loader': require.resolve('file-loader'),
        'reshape-loader': require.resolve('reshape-loader'),
        'ts-loader': require.resolve('ts-loader')
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
          test: /\.tsx?$/,
          use: [
            {
              loader: 'babel-loader',
              options: require('./babel.config')({ production })
            },
            {
              loader: 'ts-loader'
            }
          ]
        },
        {
          test: /\.sss$/,
          use: ExtractTextPlugin.extract({
            use: [
              {
                loader: 'typings-for-css-modules-loader',
                options: {
                  namedExport: true,
                  modules: true,
                  localIdentName: '[local]',
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
      new CopyWebpackPlugin(copy.filter(f => fs.existsSync(f))),
      new webpack.WatchIgnorePlugin([/sss\.d\.ts$/])
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

module.exports = ({ production, electron }) => {
  const mainConfig = baseConfig(
    { production, electron },
    {
      input: [
        fs.existsSync(path.resolve(root, 'src', 'index.tsx'))
          ? './index.tsx'
          : './index.js',
        ...htmlFiles
      ],
      output: 'scripts.js',
      copy: [
        { from: path.join(root, '_redirects') },
        { from: path.join(root, '_headers') },
        { from: path.join(root, 'manifest.json') },
        {
          from: path.join(root, 'src', 'assets', 'favicon.ico'),
          to: 'favicon.ico'
        },
        { from: path.join(root, 'src', 'assets'), to: 'assets' }
      ]
    }
  )

  const config = [mainConfig]

  if (fs.existsSync(path.resolve(root, 'src', 'sw.ts'))) {
    const swConfig = baseConfig(
      { production },
      {
        input: ['./sw.ts'],
        output: 'sw.js'
      }
    )
    config.push(swConfig)
  } else if (fs.existsSync(path.resolve(root, 'src', 'sw.js'))) {
    const swConfig = baseConfig(
      { production },
      {
        input: ['./sw.js'],
        output: 'sw.js'
      }
    )
    config.push(swConfig)
  }

  if (electron) {
    config.push(
      baseConfig(
        { production, electron },
        {
          input: [
            fs.existsSync(path.resolve(root, 'src', 'main.ts'))
              ? './main.ts'
              : './main.js',
            ...htmlFiles
          ],
          output: 'main.js',
          target: 'electron-main'
        }
      )
    )
  }

  return config
}
