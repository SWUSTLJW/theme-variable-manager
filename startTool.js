#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// 命令行参数，指定用户的配置文件路径
const configPath = process.argv[3] || path.join(process.cwd(), 'themeConfig.json');

// 检查配置文件是否存在
if (!fs.existsSync(configPath)) {
  console.error(`Config file not found at ${configPath}`);
  process.exit(1);
}

// 读取配置文件
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 打印配置文件内容
console.log('Starting tool with config:', config);

// 获取当前文件所在的目录路径
const serverPath = path.join(__dirname, './src/server.js'); // 使用 __dirname 获取当前文件路径

// 启动 Express 服务器或者你的工具逻辑，使用 spawn 来实时输出日志
const server = spawn('node', [serverPath], { stdio: 'inherit' });

// 监听错误事件
server.on('error', (err) => {
  console.error('Error starting server:', err);
});

// 监听进程退出事件
server.on('exit', (code) => {
  console.log(`Server process exited with code ${code}`);
});
