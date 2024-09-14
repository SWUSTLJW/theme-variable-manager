const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const configPath = path.join(process.cwd(), 'themeConfig.json');

// 检查配置文件是否存在
if (!fs.existsSync(configPath)) {
  console.error(`Config file not found at ${configPath}`);
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const themesDir = path.join(process.cwd(), '');
const themeFiles = config.themeFiles;

app.get('/variables', (req, res) => {
  const fileNameList = themeFiles.map(item => item.match(/\/([\w-]+)\.less$/)[1]);
  const variables = {};

  // 遍历每个主题文件
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
        // 初始化变量
        variables[name] = { comment: comment, themes: [] };
      }

      // 设置该主题的值
      variables[name].themes[index] = value;
    }

    // 如果没有匹配的变量，则添加一个占位变量
    Object.keys(variables).forEach(name => {
      if (variables[name].themes.length <= index) {
        variables[name].themes[index] = ''; // 空字符串占位
      }
    });
  });

  res.json({ fileNameList, variables });
});


app.post('/save', (req, res) => {
  const variables = req.body;

  themeFiles.forEach((file, index) => {
    const filePath = path.join(themesDir, file);
    let fileContent = '';

    for (const [name, data] of Object.entries(variables)) {
      const value = data.themes[index] ? data.themes[index] : '';
      const comment = data.comment ? `// ${data.comment}` : '';
      if (value.trim() !== '') {
        fileContent += `@${name}: ${value}; ${comment}\n`;
      }
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
  });

  res.json({ message: 'Variables saved successfully' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
