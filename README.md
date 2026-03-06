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
