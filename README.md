# Theme Variable Manager Tool

`theme-variable-manager-tool` 是一个用于管理多主题变量的工具，帮助开发者动态修改和维护主题的 `.less` 文件。

## 功能
- 动态修改主题变量
- 通过配置文件管理主题
- 自动生成配置文件

## 安装

1. 通过 npm 安装该工具：
   npm install theme-variable-manager-tool


## 使用指南
1. 生成配置文件
安装工具后，你可以使用以下命令生成默认的 themeConfig.json 配置文件：
npx theme-variable-manager-tool generate-config
该命令将在项目根目录生成一个默认的 themeConfig.json 文件，示例如下：
{
  "themes": {
    "theme1": "./themes/theme1.less",
    "theme2": "./themes/theme2.less",
    "theme3": "./themes/theme3.less"
  }
}
2. 启动工具
使用生成的配置文件启动工具，编辑或管理主题变量：
npx theme-variable-manager-tool start-tool
该命令将启动一个本地服务，你可以通过浏览器访问并编辑主题变量。

3. 自定义配置文件路径
你可以通过命令行参数指定自定义的配置文件路径：
npx theme-variable-manager-tool start-tool ./path/to/your/themeConfig.json
项目结构
|-- themes/                // 主题文件存放路径
    |-- theme1.less        // 主题1文件
    |-- theme2.less        // 主题2文件
    |-- theme3.less        // 主题3文件
|-- themeConfig.json       // 主题配置文件
## 开发者指南
如何贡献
Fork 本仓库
创建你的特性分支 (git checkout -b feature-branch)
提交你的更改 (git commit -am 'Add new feature')
推送到分支 (git push origin feature-branch)
创建一个新的 Pull Request
常见问题
如何指定配置文件？ 你可以在启动工具时通过 --config 参数指定配置文件路径：

npx theme-variable-manager-tool start-tool ./your/config/path/themeConfig.json
工具启动失败？ 确保你的配置文件格式正确，并且主题文件存在于配置指定的路径中。

许可证
本项目基于 MIT 协议开源。