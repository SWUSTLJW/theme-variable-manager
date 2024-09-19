// webpack.server.config.js
const path = require("path");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const CopyWebpackPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: {
    index: "./index.js",
    server: "./src/server.js"
  }, // 入口文件
  output: {
    path: path.resolve(__dirname, "dist/src"),
    filename: "[name].js",
  },
  target: "node",
  mode: "production",
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: true,
          mangle: true,
        },
      }),
    ],
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.BannerPlugin({
      banner: "#!/usr/bin/env node",
      raw: true,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "package.json",
          to: "package.json",
          transform(content) {
            // 修改 package.json 内容
            const packageJson = JSON.parse(content.toString());

            // 在这里对 package.json 进行修改
            // 例如，将 bin 和 main 字段指向 dist 目录
            packageJson.main = "index.bundle.js";
            packageJson.bin = {
              "theme-variable-manager": "./index.bundle.js",
            };

            // 将修改后的内容转换为 Buffer
            return Buffer.from(JSON.stringify(packageJson, null, 2), "utf-8");
          },
        }, // 复制 package.json 到 dist 目录
        { from: "README.md", to: "README.md" }, // 复制 README.md 到 dist 目录
      ],
    }),
  ],
};
