<div align="center">

# ✨ 天机问道 · 八字命格系统

**一款基于 AI 大模型的在线八字命格预测工具**

[![GitHub Pages](https://img.shields.io/badge/部署-GitHub%20Pages-lavender?style=flat-square)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-mint?style=flat-square)](LICENSE)
[![Pure Static](https://img.shields.io/badge/Pure-Static%20HTML-yellow?style=flat-square)](#)

</div>

---

## 🌸 项目简介

**天机问道**是一款纯静态的八字命格解析 Web 应用，无需后端服务器，可直接部署于 GitHub Pages。

只需输入您的生辰八字，选择想了解的方面，即由 AI 大模型为您深入解读命格、五行格局、流年运势等传统命理信息。界面采用**柔和卡通风设计**，马卡龙色调清新宜人，既保留了东方传统文化底蕴，又充满现代亲和力。

---

## ✨ 功能特性

- 🎂 **双输入模式** — 支持"生辰日期自动推算"与"直接输入八字"两种方式
- 🤖 **多模型支持** — 兼容 Anthropic Claude、OpenAI GPT 及任意 OpenAI 兼容接口（DeepSeek、Kimi、通义千问、智谱 GLM 等）
- 🔮 **命格多维解读** — 八字排盘、五行格局、大运流年、事业财运、感情婚姻等全方位分析
- 💬 **Markdown 渲染** — AI 返回内容以结构化 Markdown 格式清晰呈现，层次分明
- 🎨 **柔和卡通 UI** — 马卡龙色调（奶油黄 · 薄荷绿 · 淡粉紫）、大圆角设计、彩色投影、浮动气泡背景
- ⚙️ **可收起配置面板** — 大模型接入配置默认折叠，界面整洁不冗余，展开/折叠带平滑动画
- 🔒 **本地安全存储** — API Key 仅存储于浏览器本地，绝不上传任何服务器
- 📱 **响应式设计** — 完美适配移动端与桌面端

---

## 📸 界面预览

> 💡 部署后请替换为实际截图

```
┌──────────────────────────────────────────────┐
│          ✨  天机问道                         │
│      八字命格 · 五行分析 · AI 解读天命        │
│                  · ✦ ·                        │
│                                               │
│  ╭─ ⚙️ 大模型接入配置              [▾] ─╮   │
│  ╰─────────────────────────────────────╯   │
│  ╭─ 🎂 生辰信息 ─────────────────────────╮  │
│  │  [生辰日期] │ [直接输入八字]           │  │
│  │  出生日期: ─────  时辰: ──────        │  │
│  ╰─────────────────────────────────────╯  │
│  ╭─ 🔮 所问之事 ─────────────────────────╮  │
│  │  [综合命格✓][事业财运][感情婚姻]…      │  │
│  ╰─────────────────────────────────────╯  │
│        ╭──────────────────────╮            │
│        │   ✨  起卦问道 ✨    │            │
│        ╰──────────────────────╯            │
└──────────────────────────────────────────────┘
```

---

## 🚀 快速上手

### 在线使用

部署到 GitHub Pages 后，直接通过浏览器访问，无需安装任何依赖。

### 本地运行

```bash
# 克隆仓库
git clone https://github.com/your-username/Character-Fortune-Teller.git
cd Character-Fortune-Teller

# 推荐使用本地服务器（避免 CORS）
npx live-server
# 或
python3 -m http.server 8080
```

### 配置 API Key

1. 打开页面，点击顶部 **⚙️ 大模型接入配置** 展开配置面板
2. 选择服务商：**Anthropic** / **OpenAI** / **自定义兼容**
3. 填入对应的 API Key，点击「保存」
4. 配置仅存于本地浏览器，安全可靠

| 服务商 | Key 格式 | 获取地址 |
|---|---|---|
| Anthropic | `sk-ant-...` | [console.anthropic.com](https://console.anthropic.com/settings/keys) |
| OpenAI | `sk-...` | [platform.openai.com](https://platform.openai.com/api-keys) |
| 自定义兼容 | 各平台自定 | DeepSeek / Moonshot / 阿里云百炼 等 |

### 部署到 GitHub Pages

1. Fork 或 Push 本项目到您的 GitHub 仓库
2. 进入仓库 **Settings → Pages**
3. Source 选择 `Deploy from a branch`，Branch 选 `main`，目录选 `/ (root)`
4. 等待片刻，访问 `https://<your-username>.github.io/<repo-name>/`

---

## 🗂️ 项目结构

```
Character-Fortune-Teller/
├── index.html              # 应用入口（GitHub Pages 主页）
├── README.md               # 项目文档
└── src/
    ├── assets/
    │   ├── css/
    │   │   └── style.css   # 全局样式（马卡龙卡通风主题）
    │   └── js/
    │       ├── providers.js # 大模型服务商注册表与 API 调用适配器
    │       ├── fortune.js   # 命理逻辑（Prompt 构建、八字解析、Markdown 渲染）
    │       └── app.js       # 主应用（UI 交互、气泡背景动画、提交处理）
    ├── components/
    │   └── README.md        # 组件结构说明
    └── hooks/
        └── README.md        # 可复用逻辑说明
```

---

## 🛠️ 技术栈

| 技术 | 用途 |
|---|---|
| 纯 HTML / CSS / JS | 零依赖，无构建步骤 |
| Canvas API | 浮动气泡背景动画 |
| CSS Grid animation | 丝滑的折叠/展开过渡 |
| Fetch API | 直连 LLM API（含 CORS 支持） |
| localStorage | API Key 安全本地存储 |
| GitHub Pages | 静态托管，免费部署 |

---

## 📜 免责声明

本应用的命格解读结果由 AI 大模型生成，**仅供参考和娱乐，不构成任何人生决策建议**。
天命在我，命运由心。

---

## 📄 License

[MIT License](LICENSE) © 2025
