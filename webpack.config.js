
const path = require('path')
var Crypto = require('crypto')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const bell = require('bell-on-bundler-error-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')
const BabiliPlugin = require('babili-webpack-plugin')

const paths = {
  srcJS: path.join(__dirname, 'assets', 'js', 'src'),
  buildJS: path.join(__dirname, 'assets', 'js', 'build'),
  htmlSrc: path.join(__dirname, '_layouts')
}
const randomBytes = Crypto.randomBytes(20).toString('hex')
/*****
* Note: we use the github jekyll metadata in the js in the default.html (in a script tag), and since jekyll compiles
* the `{{ site.github.releases | jsonify }}` into the script tag as json, when we create a new release, we also
* need to get github's jekyll build to re-build the html so that it recompiles that javascript with the new
* github jekyll metadata relase data. - we could do this by changing a character in the html, but I'm gonna do
* it by changing the name of the js file that is inserted into the html by the HtmlWebpackPlugin. It's kind of
* a round a bout way of changing the html, but it's the easiest.
*
* Also we need to change the public path for production so it points to the github pages url, as the path is
* different when we're in dev and jekyll is serving it from localhost.
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
              presets: ['latest']
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

if(process.env.production){
  console.log('Running production build.')
  webpackConfig.devtool = 'cheap-module-source-map'
  webpackConfig.plugins.push(new BabiliPlugin({comments: false, sourceMap: false}))
}

module.exports = webpackConfig
