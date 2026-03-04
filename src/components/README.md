# Components

本目录记录应用的逻辑 UI 组件结构。

由于项目是纯静态 HTML 应用，无构建步骤，所有组件均以 HTML 片段形式内联于 `index.html` 中。本文档作为组件结构的规范性说明。

---

## 组件一览

### `ApiConfigPanel`
- **位置**：`index.html` — API 配置区块
- **描述**：可折叠的大模型服务商配置面板，默认收起
- **状态**：通过 `toggleApiConfig()` 控制展开/折叠，含 CSS Grid 平滑过渡动画
- **相关逻辑**：`src/assets/js/providers.js` — `setProtocol()` / `saveConfig()` / `clearConfig()`

### `BirthInfoCard`
- **位置**：`index.html` — 生辰信息区块
- **描述**：两种输入模式的 Tab 切换表单
  - **日期模式**：填写出生日期 + 时辰，由 AI 自动推算八字
  - **手动模式**：直接选择年/月/日/时柱的天干地支
- **切换逻辑**：`switchTab('date' | 'manual')` in `src/assets/js/app.js`

### `QuestionCard`
- **位置**：`index.html` — 所问之事区块
- **描述**：多选标签 + 自由文本的问题输入
- **逻辑**：`getTopics()` in `src/assets/js/fortune.js`

### `ResultCard`
- **位置**：`index.html` — 命格解析区块
- **描述**：展示八柱可视化卡片 + AI 解读内容（Markdown 渲染）
- **可见性**：默认隐藏，`submit()` 成功后显示

### `BubbleBackground`
- **位置**：`src/assets/js/app.js` — IIFE 顶部
- **描述**：Canvas 浮动气泡动画，使用马卡龙色系（薄荷/薰衣草/黄/粉/蜜桃）

---

## 未来扩展方向

如需引入构建工具（如 Vite），可将各组件拆分为独立的 `.html` 模板或 Web Components，保持此目录作为组件根目录。
