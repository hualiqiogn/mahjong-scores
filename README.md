# 麻将计分小程序

一个基于 React + Taro 开发的微信小程序，用于麻将四人对战实时计分和历史记录。

## ✨ 功能特点

- **实时计分**：支持两种模式
  - 累计模式：每局记录每个人得分（正负分），自动累加
  - 倍率模式：记录赢家和倍率，自动计算每个人得分
- **多人对战**：支持 4 人同时加入房间
- **对局记录**：每局历史记录可查看详情，支持分页
- **结算页面**：游戏结束后显示排名和奖牌
- **俏皮提示**：得分/给分超过一定次数显示横幅提示
- **微信小程序**：纯原生微信小程序，无需浏览器

## 🛠️ 技术栈

- **框架**：React 18 + TypeScript + Taro 4
- **状态管理**：Zustand (持久化存储，支持 taroStorage)
- **后端存储**：Supabase (PostgreSQL + REST API)
- **同步方案**：轮询 (2 秒间隔) + 本地即时更新

## 🚀 快速开始

### Web 端开发

```bash
npm install
npm run dev
```

### 微信小程序打包

```bash
npm run build:weapp
```

## 📁 目录结构

```
src/
├── components/       # 组件
│   ├── PlayerCards.tsx
│   ├── RoundHistory.tsx
│   ├── ScoreModal.tsx
│   ├── GameOverModal.tsx
│   └── ...
├── pages/            # 页面
│   └── index.tsx
├── store/            # Zustand store
│   └── gameStore.ts
├── services/         # API 服务
│   └── roomService.ts
└── lib/              # 工具
    └── supabase.ts
```

## 🎯 项目背景

项目从纯 Web 版开始，后改造为 Taro 微信小程序。由于小程序环境限制，移除了：
- Supabase WebSocket 实时订阅
- `@supabase/supabase-js` SDK
- 部分不兼容的 CSS (calc, radial-gradient, overflow-auto 等)

改为：
- 纯 `wx.request` REST API
- 本地即时更新 + 2 秒轮询同步
- 时间戳保护机制防止轮询覆盖本地操作
- 结算游戏互不影响（只设本地状态）

## 📄 许可证

MIT License

