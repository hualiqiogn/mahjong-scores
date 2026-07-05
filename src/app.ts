import { PropsWithChildren, useEffect } from 'react';

// ============ 全局分享配置 ============
// 作用：为所有页面自动注入 onShareAppMessage 和 onShareTimeline
// 原理：重写微信小程序原生 Page 构造函数，在页面注册时自动挂载分享逻辑
// 限制：如果某个页面自己定义了分享方法，以页面自己的为准（不覆盖）
const SHARE_CONFIG = {
  /** 转发给好友/群聊 */
  appMessage: {
    title: '鱼乐无穷｜多人麻将计分工具',
    desc: '免费线上记牌算分，4人联机同步对局数据',
    path: '/pages/index/index',
    // 分享封面图：麻将红中牌，public/share-cover.png 编译后会自动放入 dist/
    imageUrl: '/share-cover.png',
  },
  /** 分享到朋友圈 */
  timeline: {
    title: '鱼乐无穷｜多人麻将计分工具',
    query: '',
    imageUrl: '/share-cover.png',
  },
};
// =====================================

function App({ children }: PropsWithChildren) {
  useEffect(() => {
    // 仅在微信小程序环境生效（H5/其他平台不执行）
    if (typeof wx !== 'undefined' && wx.getSystemInfoSync) {
      try {
        // 保存原生 Page 构造函数，避免破坏 Taro 框架逻辑
        const originalPage = Page;

        // 重写 Page 构造函数：所有页面注册时自动挂载分享方法
        (globalThis as any).Page = function(options: any = {}) {
          // 若页面自己没有定义 onShareAppMessage，注入全局转发配置
          if (!options.onShareAppMessage) {
            options.onShareAppMessage = function() {
              return { ...SHARE_CONFIG.appMessage };
            };
          }

          // 若页面自己没有定义 onShareTimeline，注入全局朋友圈配置
          if (!options.onShareTimeline) {
            options.onShareTimeline = function() {
              return { ...SHARE_CONFIG.timeline };
            };
          }

          // 调用原生 Page 完成页面注册
          return originalPage(options);
        };
      } catch (e) {
        // 注入失败静默处理，确保不影响页面正常渲染
        console.warn('全局分享注入失败:', e);
      }
    }
  }, []);

  return children;
}

export default App;
