# 🀄 我用 React + Taro 造了个麻将计分小程序，从此牌桌上再也没人赖账了！

> **"刚才那局我输了多少来着？"** —— 每个麻将桌上的灵魂拷问

## 🎯 起因：一个被麻将逼疯的程序员

过年回家打麻将，每次算分都像在做数学期末考试：

- "你刚才给我加了10还是20？"
- "等等，我上一局是-5还是-15？"
- "这局到底谁赢了？？？"

纸笔记录？太原始了。心算？算到第三局就翻车了。用计算器？你见过谁打麻将还掏计算器的吗？

于是，作为一个有尊严的程序员，我决定——**自己写一个！**

## 🀄 成品展示

**鱼乐无穷** —— 一个微信小程序，扫码即用，4人同房，实时计分，再也不用为"你欠我多少"这种事吵架了。

### 核心功能

| 功能 | 说明 |
|------|------|
| 🎮 两种计分模式 | 累计模式（想加多少加多少）+ 倍率模式（选赢家定倍率） |
| 🏠 6位数字房间号 | 输入房间号就能加入，比输WiFi密码还简单 |
| 📋 对局记录弹窗 | 分页查看每一局的详细得分，翻旧账利器 |
| 🏅 结算排名奖牌 | 金银铜+参与奖，第四名也有尊严 |
| 🎏 横批俏皮提示 | 得分多了给你挂横幅，比过年贴春联还喜庆 |
| 🔄 实时同步 | 自己操作0延迟，别人2秒内同步 |

## 🛠️ 技术选型：从翻车到翻盘

### 第一版：React Web + Supabase 实时

最初的想法很简单：React 写页面，Supabase 做后端，WebSocket 实时同步，完美！

```javascript
// 浏览器里跑得好好的
const channel = supabase.channel('room')
channel.on('postgres_changes', ...)  // 实时同步，丝滑！
```

**浏览器里一切正常**，我甚至觉得自己是个天才。

### 转折：微信小程序说"不"

然后我天真地以为，用 Taro 转译一下就能变成小程序了。

结果微信小程序环境给了我一套**连环暴击**：

#### 💥 暴击1：`Headers is not defined`

```
ReferenceError: Headers is not defined
```

小程序：什么是 Headers？我不认识。我只有 `wx.request`。

#### 💥 暴击2：`Failed to construct 'URL'`

```
Error: Failed to construct 'URL': Invalid URL
```

Supabase SDK 内部调用了 `new URL()`，但小程序里没有浏览器的 URL API，Taro 的 TaroURL 实现直接崩溃。

#### 💥 暴击3：WebSocket？不存在的

小程序不支持 Supabase 的 WebSocket 实时订阅。实时同步？想都别想。

#### 💥 暴击4：CSS 也不行

```
calc() ❌  radial-gradient ❌  overflow:auto ❌  vh ❌  animation ❌
```

小程序的 CSS 就像是一个被阉割的浏览器，你以为能用的，它都不支持。

### 翻盘：全部推倒重来

既然小程序这么"有个性"，那我就**按它的规矩来**！

#### 1️⃣ 干掉 Supabase SDK，纯 wx.request 走起

```typescript
function singleRequest<T>(method: string, path: string, body?: any): Promise<T> {
  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE + '/rest/v1/' + path,
      method,
      header: headers(),
      data: body || undefined,
      success: (res: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(`Supabase ${res.statusCode}`));
        }
      },
      fail: () => { reject(new Error('network fail')); },
    });
  });
}
```

没有 SDK？我自己写！直接调 Supabase REST API，简单粗暴，但**管用**。

#### 2️⃣ WebSocket → 轮询 + 本地即时更新

既然不能实时推送，那就轮询！但有个关键问题：**自己操作必须0延迟**。

```typescript
// 核心思路：本地先更新，异步写库
recordRound: (scores) => {
  // 1. 本地立即更新（0延迟）
  set(state => ({ rounds: [...state.rounds, newRound] }));
  // 2. 异步写库（不阻塞UI）
  recordRoundToSupabase(roomId, newRound).catch(() => {});
}
```

同时加了**3秒保护期**，防止轮询拉回旧数据覆盖本地新操作：

```typescript
// 轮询同步时：3秒内的本地更新拒绝被覆盖
if (Date.now() - state._lastLocalUpdate < 3000) return;
```

#### 3️⃣ CSS 兼容：一个一个替换

```css
/* 浏览器 */           →  /* 小程序 */
width: calc(50% - 8px) →  width: 48%
height: 80vh           →  height: 500px
background: radial-gradient(...) → background-color: rgba(255,255,255,0.4)
overflow: auto          →  overflow: hidden
text-transform: uppercase → JS: str.toUpperCase()
```

没有花里胡哨，但**该有的效果一个不少**。

## 🏅 第四名的尊严：参与奖

排名系统里，前三名有金银铜牌，第四名呢？

一开始第四名啥也没有，看着别人闪闪发光自己灰溜溜的，太惨了。

于是我给第四名加了一个**清新绿色渐变 + 🎖️勋章**的参与奖奖牌：

```
🥇 第1名 - 金牌   "牌神降临，所向披靡！"
🥈 第2名 - 银牌   "实力不俗，下次翻盘！"
🥉 第3名 - 铜牌   "稳扎稳打，潜力无限！"
🎖️ 第4名 - 参与奖  "重在参与，下次一定能赢回来！"
```

**每个人都是赢家**（虽然有些人赢得比较体面）。

## 🎏 横批效果：比春联还喜庆

当某个玩家得分或给分超过一定次数时，会弹出一条俏皮提示。我把它做成了**横批效果**——铺满整个卡片宽度，渐变背景，文字居中：

```
┌─────────────────────────────────┐
│  🎉 得分王！今天手气爆棚！      │
└─────────────────────────────────┘
```

比过年贴春联还喜庆，打麻将打出了过年的感觉。

## 🐛 那些年踩过的坑

### 坑1：双重 JSON.parse

Taro.request 在 `Content-Type: application/json` 时已经自动解析了，再调 `JSON.parse` 就报错：

```typescript
// ❌ 错误写法
const data = JSON.parse(res.data);  // res.data 已经是对象了！

// ✅ 正确写法
if (typeof data === 'string') {
  try { resolve(JSON.parse(data)); } catch { resolve(data); }
} else { resolve(data); }
```

### 坑2：轮询请求堆积

轮询间隔 1500ms，但网络延迟 1576ms，请求越堆越多，最后雪崩：

```
请求1 → 还没回来
请求2 → 又发出去了
请求3 → 又又发出去了
... 💥 雪崩
```

**解决方案**：串行轮询，等上一轮完成再发下一轮：

```typescript
const doPoll = async () => {
  if (isPolling) return;
  isPolling = true;
  await pollRoomData();
  isPolling = false;
  pollTimer = setTimeout(doPoll, 2000);
};
```

### 坑3：结算游戏互不影响

A 点击结算，B 的页面也跟着结算了？不行！

**解决方案**：结算状态只存本地，不同步到远程：

```typescript
endGame: () => {
  set({ isGameOver: true });  // 只设本地，不写库
}
```

每个人自己点结算才能看到结算页面，互不干扰。

### 坑4：微信基础库的神秘 timeout

```
Error: timeout from WAServiceMainContext.js
```

这是微信框架 3.15.2 灰度版的内部问题，不是业务代码的问题。

**解决方案**：降基础库到 3.4.0 稳定版 + 去掉请求 timeout 参数。

## 📊 最终技术架构

```
┌──────────────┐     wx.request      ┌──────────────────┐
│  微信小程序   │ ──────────────────→ │  Supabase REST   │
│  (Taro 4)    │ ←────────────────── │  (PostgreSQL)    │
│              │     JSON Response    │                  │
│  ┌────────┐  │                      └──────────────────┘
│  │ Zustand│  │
│  │ Store  │  │  本地即时更新
│  │ (persist)│  │  + 2秒轮询同步
│  └────────┘  │  + 3秒保护期
└──────────────┘
```

## 🚀 上线！

项目已经成功上传微信小程序平台，正在审核中。

**GitHub 开源地址**：https://github.com/hualiqiogn/mahjong-scores

欢迎 Star ⭐，欢迎 Fork 🍴，欢迎提 Issue 🐛

## 💡 总结

从 React Web 到微信小程序，这条路走得不容易，但每一步踩过的坑都是经验：

1. **小程序环境 ≠ 浏览器**，别指望所有 Web API 都能用
2. **实时同步不行就轮询**，但要做好防覆盖和串行控制
3. **CSS 兼容要逐个检查**，calc/vh/gradient 都可能翻车
4. **用户体验优先**，自己操作0延迟，别人延迟可接受
5. **第四名也需要尊严**，参与奖安排上

最后，祝大家打麻将天天赢，牌牌自摸！🀄🎉

---

*如果这篇文章对你有帮助，点个赞👍再走呗~*
