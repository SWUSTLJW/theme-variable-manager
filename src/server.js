const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();

const fileTypeList = ['less', 'scss'];
let port = 3000;
let fileType = 'less';

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// 存放@import导入语句
let imports = [];
const configPath = process.argv[2] || path.join(process.cwd(), 'themeConfig.json');

// 检查配置文件是否存在
if (!fs.existsSync(configPath)) {
  console.error(`Config file not found at ${configPath}`);
  process.exit(1);
}

// 读取配置文件
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
port = config.port && !isNaN(config.port) ? config.port : 3000;
fileType = config.fileType && fileTypeList.some(f => f === config.fileType) ? config.fileType : 'less';
const themesDir = path.join(process.cwd(), '');
const themeFiles = config.themeFiles;

app.get('/variables', (req, res) => {
  const fileNameList = themeFiles.map(item => fileType === 'less' ? item.match(/\/([\w-]+)\.less$/)[1] : item.match(/\/([\w-]+)\.scss$/)[1]);
  const variables = {};
  imports = [];

  // 遍历每个主题文件
  themeFiles.forEach((file, index) => {
    const filePath = path.join(themesDir, file);
    const data = fs.readFileSync(filePath, 'utf8');

    // 匹配所有的 @import 语句
    const importStatements = data.match(/^@import\s+.*;$/gm) || [];

    const variableRegex = fileType === 'less' ? /@([\w-]+):\s*([^;]+);\s*(\/\/.*)?/g : /\$([\w-]+):\s*([^;]+);\s*(\/\/.*)?/g;
    let match;

    // 存储每个主题文件的导入语句
    imports[index] = importStatements.join('\n');

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
      if (variables[name].themes?.length <= index) {
        variables[name].themes[index] = ''; // 空字符串占位
      }
    });
  });

  res.json({ fileNameList, variables });
});


app.post('/save-variables', (req, res) => {
  const variables = req.body;
  const headChar = fileType === 'less' ? '@' : '$';

  themeFiles.forEach((file, index) => {
    const filePath = path.join(themesDir, file);
    let fileContent = '';
    
     // 获取当前文件的导入语句
     const tempImports = imports[index] ? `${imports[index]}\n\n` : '';

     // 保留原始的导入语句
    fileContent += tempImports;

    for (const [name, data] of Object.entries(variables)) {
      const value = data.themes[index] ? data.themes[index] : '';
      const comment = data.comment ? `// ${data.comment}` : '';
      if (value.trim() !== '') {
        fileContent += `${headChar}${name}: ${value}; ${comment}\n`;
      }
    }

    fs.writeFileSync(filePath, fileContent, 'utf8');
  });

  res.json({ message: 'Variables saved successfully' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
