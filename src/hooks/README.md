# Hooks

本目录预留用于存放可复用的状态逻辑与副作用封装（"hooks" 模式）。

在原生 JS 环境中，"hook" 可以实现为工厂函数，封装内部状态与副作用，对外暴露操作接口。

---

## 现有隐式 Hooks（待提取）

以下逻辑目前分散于 `src/assets/js/` 中，可在未来重构中提取为独立 Hook 模块：

### `useLocalStorage(key, defaultValue)`
封装 `localStorage` 的读写，支持响应式更新通知。
- 当前位置：`providers.js` — `setProtocol()` / `saveConfig()` / `clearConfig()`

### `useProtocol()`
封装当前 LLM 协议状态及提供商切换逻辑，暴露 `current`、`set(proto)` 接口。
- 当前位置：`providers.js` — `currentProtocol` 变量及相关函数

### `useFortuneRequest()`
封装异步 LLM 请求的完整生命周期：`loading` 状态、错误处理、结果解析。
- 当前位置：`app.js` — `submit()` 函数

### `useCollapsible(gridId, headerId)`
封装可折叠面板的状态切换与无障碍属性更新。
- 当前位置：`app.js` — `toggleApiConfig()` 函数

---

## 示例：未来 Hook 实现

```javascript
// src/hooks/useLocalStorage.js
function useLocalStorage(key, defaultValue) {
  const get = () => {
    try { return JSON.parse(localStorage.getItem(key)) ?? defaultValue; }
    catch { return defaultValue; }
  };
  const set = (value) => localStorage.setItem(key, JSON.stringify(value));
  const remove = () => localStorage.removeItem(key);
  return { get, set, remove };
}
```
