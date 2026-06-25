const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const outputDirectory = 'dist';

module.exports = {
  entry: ['core-js/stable', './src/client/index.js'],
  output: {
    path: path.join(__dirname, outputDirectory),
    filename: 'bundle.js'
  },
  module: {
    rules: [{
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 100000
          }
        }
      },
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js', '.jsx', '.mjs']
  },
  devServer: {
    port: 8080,
    open: true,
    proxy: [
      {
        context: ['/api', '/'],
        target: 'http://localhost:5001',
        changeOrigin: true,
        bypass: function(req, res, proxyOptions) {
          // Don't proxy requests for webpack assets
          if (req.url.indexOf('.hot-update.') !== -1 ||
              req.url.indexOf('webpack') !== -1 ||
              req.url.indexOf('.js') !== -1 ||
              req.url.indexOf('.css') !== -1) {
            return req.url;
          }
          // Proxy API requests and POST requests to backend
          if (req.url.startsWith('/api') || req.method === 'POST') {
            return null; // Let proxy handle it
          }
          // For root path GET requests, serve index.html from webpack
          if (req.url === '/' && req.method === 'GET') {
            return '/index.html';
          }
        }
      }
    ]
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      favicon: './public/favicon.ico'
    })
  ]
};