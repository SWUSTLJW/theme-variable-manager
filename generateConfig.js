#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 默认的主题配置文件内容
const defaultConfig = {
  themeFiles: [
    './styles/themes/theme1.less',
    './styles/themes/theme2.less',
    './styles/themes/theme3.less'
  ]
};

// 命令行参数，用于指定配置文件生成路径
const configPath = process.argv[3] || path.join(process.cwd(), 'themeConfig.json');

// 写入默认配置文件
fs.writeFile(configPath, JSON.stringify(defaultConfig, null, 2), (err) => {
  if (err) {
    console.error('Error creating config file:', err);
  } else {
    console.log(`Config file created at ${configPath}`);
  }
});
