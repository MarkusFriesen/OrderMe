var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var path = require("path");
var webpack = require('webpack');

var isProd = process.argv.indexOf('-p') !== -1

var cssDev = ['style-loader', 'css-loader', 'sass-loader'];
var cssProd = ExtractTextPlugin.extract({
  fallback: 'style-loader',
  loader: ['css-loader', 'sass-loader'],
  publicPath: '/src/server/public/assets/styles'
})

var cssConfig = isProd ? cssProd : cssDev;

module.exports = {
  entry: './src/client/js/app.js',
  output: {
    path: isProd ? path.join(__dirname, 'src/server/public/') : path.resolve(__dirname, "dist"),
    filename: 'app.bundle.js'
  },
  module: {
    rules: [{
        test: /\.s?css$/,
        use: cssConfig
      },
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['react', 'es2015', 'stage-0'],
            plugins: ['react-html-attrs', 'transform-decorators-legacy', 'transform-class-properties'],
          }
        }
      },
      {
        test: /(\.png|\.jpe?g)$/,
        use: 'file-loader?name=[name].[ext]&publicPath=/&outputPath=assets/img/',
      }
    ]
  },
  devServer: {
    contentBase: path.join(__dirname, "src/server/public/"),
    compress: true,
    stats: "errors-only",
    open: true,
    hot: true,
    setup: function(app){
      app.delete('/api/orders', function (req, res){
        res.status(200).json({})
      });

      app.post('/api/orders', function(req, res){
        //TODO: figure out where order is in req
        res.status(200).json({})
      });
    }
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: 'Order',
      has: true,
      template: './src/client/index.html'
    }),
    new ExtractTextPlugin({
      filename: 'app.css',
      disable: !isProd,
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin()
  ]
}