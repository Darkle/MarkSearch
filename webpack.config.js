
const path = require('path')
var Crypto = require('crypto')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const bell = require('bell-on-bundler-error-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')

const paths = {
  srcJS: path.join(__dirname, 'assets', 'js', 'src'),
  buildJS: path.join(__dirname, 'assets', 'js', 'build'),
  htmlSrc: path.join(__dirname, '_layouts')
}
const randomBytes = Crypto.randomBytes(20).toString('hex')
/*****
* We want to change the filename for production task so that it busts the github pages cache on the github servers
* as the repo metadata for the github pages doesn't seem to be updated on the github pages unless there has been a change
* to one of the files. - we use the metadata in the js for the download links.
*
* Also we need to change the public path for production so it points to the github pages url.
*/
const outputFilename = process.env.production ? `index-build-${ randomBytes }.js` : 'index-build-[hash].js'
const publicPath = process.env.production ? '{{ site.github.url }}/assets/js/build/' : '/assets/js/build/'

const webpackConfig = {
  devtool: 'source-map',
  target: 'web',
  entry: {
    srcJS: path.join(paths.srcJS, 'index-src.js'),
  },
  output: {
    path: paths.buildJS,
    filename: outputFilename,
    sourceMapFilename: '[file].map',
    publicPath
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        use: [
          {
            loader: 'eslint-loader'
          },
        ],
        include: [
          paths.srcJS
        ],
        exclude: /(node_modules)/,
      },
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            query: {
              presets: ['es2015']
            }
          },
        ],
        include: [
          paths.srcJS
        ],
        exclude: /(node_modules)/,
      }
    ]
  },
  resolve: {
    extensions: ['.js']
  },
  plugins: [
    new bell(),
    new WebpackCleanupPlugin(),
    new HtmlWebpackPlugin({
      filename: path.resolve(paths.htmlSrc, 'default.html'),
      template: path.resolve(paths.htmlSrc, 'default-src.html'),
      chunks: [
        'srcJS'
      ],
      cache: false
    }),
  ]
}


module.exports = webpackConfig
