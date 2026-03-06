# 月报填写工具

自动化工具，用于从 Worktile 平台获取工时数据并自动生成月报内容。

## 功能特性

- ✅ 自动获取 Worktile 工时数据
- ✅ 自动生成重点工作清单表格
- ✅ K线用时统计（支持关键字匹配分类）
- ✅ 工作日天数计算（自动排除周末和法定节假日）
- ✅ AI 工作自评生成（生成3个参考版本）

## 技术栈

- Vue 3
- Element Plus
- Axios
- Day.js
- Vite

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 部署到 GitHub Pages

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "chore: add github pages deployment"
git push origin main
```

### 2. 开启 Pages

1. 打开仓库 `Settings` -> `Pages`
2. 在 `Build and deployment` 中选择 `Source: GitHub Actions`
3. 等待仓库中的 `Deploy to GitHub Pages` 工作流执行完成

### 3. 访问地址

页面会发布到：

`https://<你的GitHub用户名>.github.io/month-report-auto/`

例如：`https://GugaLiz.github.io/month-report-auto/`

### 4. 部署 Cloudflare Worker 代理（在线版必做）

> GitHub Pages 仅提供静态页面，无法代理 Worktile 请求。
> 需要先部署 Worker，再把 Worker 地址注入前端构建变量。

1. 安装并登录 Wrangler

```bash
npm install -g wrangler
wrangler login
```

2. 部署 Worker（在项目根目录执行）

```bash
cd worker
wrangler deploy
```

部署成功后你会得到 Worker 地址，例如：

`https://month-report-auto-proxy.<your-subdomain>.workers.dev`

3. 可选：限制允许访问来源（推荐）

在 Cloudflare Worker 控制台中为该 Worker 添加环境变量：

- 变量名：`ALLOWED_ORIGIN`
- 变量值：`https://<你的GitHub用户名>.github.io`

4. 回到 GitHub 仓库配置前端构建变量

打开 `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`，新增：

- Name: `VITE_PROXY_BASE_URL`
- Value: `https://month-report-auto-proxy.<your-subdomain>.workers.dev`

5. 重新触发 Pages 构建发布

```bash
git add .
git commit -m "chore: configure cloudflare worker proxy"
git push origin main
```

### 5. 验证是否生效

1. 打开在线页面：`https://<你的GitHub用户名>.github.io/month-report-auto/`
2. 在浏览器访问 Worker 健康检查：`https://<worker域名>/health`
3. 返回 `{"ok":true,"service":"worktile-proxy"}` 说明代理正常
4. 回到页面配置 Cookie 并点击“获取工时数据”进行实测

## 使用说明

1. **配置 Cookie**
   - 首次使用需要配置 Worktile Cookie
   - 在设置页面输入从浏览器获取的 Cookie 值

2. **选择日期范围**
   - 设置开始日期和结束日期
   - 通常选择整个月的范围

3. **获取数据**
   - 点击"获取工时数据"按钮
   - 系统自动调用 API 并处理数据

4. **查看结果**
   - 重点工作清单
   - K线用时统计
   - 工作自评参考文本
   - 本月工作日天数

5. **导出数据**
   - 支持复制表格到剪贴板
   - 支持导出为 Excel 文件

## Cookie 获取方法

1. 打开 Chrome 浏览器
2. 访问 Worktile 网站并登录
3. 按 F12 打开开发者工具
4. 切换到 Network 面板
5. 刷新页面
6. 找到任意请求，查看 Request Headers
7. 复制 Cookie 字段的值

## 项目结构

```
month-report-auto/
├── src/
│   ├── api/              # API 接口
│   │   └── worktile.js
│   ├── components/       # Vue 组件
│   │   ├── DateSelector.vue
│   │   ├── WorkTable.vue
│   │   ├── KLineStats.vue
│   │   └── SelfEvaluation.vue
│   ├── utils/            # 工具函数
│   │   ├── date.js
│   │   ├── kline.js
│   │   ├── workday.js
│   │   └── storage.js
│   ├── data/             # 数据文件
│   │   └── holidays.js
│   ├── App.vue           # 根组件
│   └── main.js           # 应用入口
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 许可证

MIT
