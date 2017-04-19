const { resolve } = require('path');
const webpack = require('webpack');

module.exports = {

  context: resolve(__dirname, './src'),

  entry: {
    app: './app.js'
  },

  output: {
    path: resolve(__dirname, './dist/assets'),
    publicPath: '/assets',
    filename: '[name].bundle.js'
  },

  devtool: 'source-maps',

  resolve: {
    alias: {
      react: resolve('./node_modules/react'),
      immutable: resolve('./node_modules/immutable'),
      'gl-matrix': resolve('./node_modules/gl-matrix/dist/gl-matrix.js'),
      'mapbox-gl$': resolve('./node_modules/mapbox-gl/dist/mapbox-gl.js'),
      '../fonts': resolve('./node_modules/bootstrap/dist/fonts')
    }
  },

  module: {

    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /(node_modules)/
      },

      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1
            }
          },
          'postcss-loader'
        ]
      },

      {
        test: /\.csv$/,
        loader: 'dsv-loader'
      },

      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader?limit=100000'
      }
    ]

  },

  plugins: [
    new webpack.EnvironmentPlugin([ 'MAPBOX_ACCESS_TOKEN' ])
  ],

  devServer: {
    contentBase: resolve(__dirname, './src'),
    proxy: {
      '/api/**': {
        target: 'http://localhost:8001',
        secure: false,
        changeOrigin: true
      }
    }
  },

  node: {
    fs: 'empty'
  }

};
