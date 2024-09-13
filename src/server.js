const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

// 静态资源目录
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 读取配置文件
const configPath = path.join(process.cwd(), 'themeConfig.json');

// 检查配置文件是否存在
if (!fs.existsSync(configPath)) {
  console.error(`Config file not found at ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

// 主题文件目录
const themesDir = path.join(process.cwd(), '');
const themeFiles = config.themeFiles;

// 读取主题文件并解析变量
app.get('/variables', (req, res) => {
  const variables = {};

  themeFiles.forEach((file, index) => {
    const filePath = path.join(themesDir, file);
    const data = fs.readFileSync(filePath, 'utf8');
    const variableRegex = /@([\w-]+):\s*([^;]+);\s*(\/\/.*)?/g;
    let match;

    while ((match = variableRegex.exec(data)) !== null) {
      const name = match[1];
      const value = match[2].trim();
      const comment = match[3] ? match[3].trim().substring(2).trim() : '';

      if (!variables[name]) {
        variables[name] = {};
      }

      variables[name][`theme${index + 1}`] = { value, comment };
    }
  });

  // Ensure all variables are represented for each theme
  themeFiles.forEach((_, index) => {
    Object.keys(variables).forEach(name => {
      if (!variables[name][`theme${index + 1}`]) {
        variables[name][`theme${index + 1}`] = { value: '', comment: '' };
      }
    });
  });

  res.json(variables);
});

// 保存修改后的变量
app.post('/save', (req, res) => {
  const variables = req.body;

  themeFiles.forEach((file, index) => {
    const filePath = path.join(themesDir, file);
    let fileContent = '';

    // 逐个变量写入文件
    for (const [name, themes] of Object.entries(variables)) {
      const theme = `theme${index + 1}`;
      const value = themes[theme] ? themes[theme].value : '';
      const comment = themes[theme] ? themes[theme].comment : '';

      // 只写入非空值的变量
      if (value.trim() !== '') {
        fileContent += `@${name}: ${value}; ${comment ? '// ' + comment : ''}\n`;
      }
    }

    // 写入文件
    fs.writeFileSync(filePath, fileContent, 'utf8');
  });

  res.json({ message: 'Variables saved successfully' });
});

// 启动服务器
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
