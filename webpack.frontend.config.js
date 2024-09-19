const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    index: './src/public/index.html',
    app: "./src/public/app.js"
  }, // 前端 JavaScript 入口文件
  output: {
    path: path.resolve(__dirname, 'dist/src/public'),
    filename: '[name].js', // 输出的 JavaScript 文件
    clean: true, // 清理 /dist 文件夹
  },
  module: {
    rules: [
      {
        test: /\.js$/, // 处理 JavaScript 文件
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
      {
        test: /\.html$/, // 处理 HTML 文件
        use: 'html-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/public/index.html', // 原始 HTML 文件路径
      filename: 'index.html', // 输出的 HTML 文件名
      inject: 'body', // 将脚本注入到 body 中
    }),
  ],
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: true, // 启用压缩
          mangle: true,   // 启用混淆
        },
      }),
    ],
  },
  stats: {
    children: true, // 显示子编译错误
  },
};
