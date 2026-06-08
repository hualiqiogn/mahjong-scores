import { View, Text } from '@tarojs/components';
import { useState, useEffect, useRef } from 'react';

const GIVE_MESSAGES = [
  '哎呀，手气不太顺呀~',
  '稳住，这只是暂时的！',
  '风水轮流转，快触底反弹了！',
  '坚持住，否极泰来！',
  '别灰心，运气守恒定律！',
  '越努力越幸运！',
  '大方出奇迹！',
  '散财童子转世？',
  '你的善良终将被回报！',
  '给分给到手软！',
  '慈善家本家了！',
  '别人笑你太疯癫，你笑别人看不穿！',
  '这波啊，这波是大爱无疆！',
  '你是不是偷偷喜欢给大家加分？',
  '活菩萨在线发分！',
  '给分侠，出击！',
  '你是来交朋友的不是来赢的！',
  '全场最佳气氛组！',
  '你是麻将界的活雷锋！',
  '这格局，已经超越输赢了！',
];

const GAIN_MESSAGES = [
  '手气旺旺旺！',
  '势不可挡，继续保持！',
  '运气爆棚，大杀四方！',
  '人生巅峰，不过如此！',
  '常胜将军，舍我其谁！',
  '麻将之神眷顾你！',
  '赢家通吃，霸气侧漏！',
  '今天是你的主场！',
  '神挡杀神，佛挡杀佛！',
  '这运气，买彩票吧！',
  '逆天改命，就是这么简单！',
  '别人打牌你收租！',
  '天选之人，不服不行！',
  '你的对手已经开始怀疑人生了！',
  '麻将桌上的收割机！',
  '赢到对手想回家！',
  '你是不是偷偷开了外挂？',
  '一人得道，鸡犬升天！',
  '连老天爷都帮你！',
  '传说中的麻将之王！',
];

interface PlayfulBadgeProps {
  type: 'give' | 'gain';
  count: number;
  compact?: boolean;
}

export default function PlayfulBadge({ type, count, compact = false }: PlayfulBadgeProps) {
  const [visible, setVisible] = useState(false);
  const [displayCount, setDisplayCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevCountRef = useRef(count);

  useEffect(() => {
    if (count > prevCountRef.current && count >= 3) {
      setDisplayCount(count);
      setVisible(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setVisible(false);
      }, 7000);
    }

    prevCountRef.current = count;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [count]);

  if (!visible || count < 3) {
    return null;
  }

  const icon = type === 'give' ? '🔥' : '📈';
  const messages = type === 'give' ? GIVE_MESSAGES : GAIN_MESSAGES;
  const messageIndex = Math.min(displayCount - 3, messages.length - 1);
  const message = messages[messageIndex];

  if (compact) {
    // 紧凑模式：完整显示文案，固定高度药丸，在卡片行内居中
    return (
      <View style={{
        height: 22,
        paddingLeft: 6,
        paddingRight: 6,
        borderRadius: 11,
        background: type === 'gain'
          ? 'linear-gradient(135deg, #fbbf24, #f97316)'
          : 'linear-gradient(135deg, #60a5fa, #a78bfa)',
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Text style={{ fontSize: 11, marginRight: 2 }}>{icon}</Text>
        <Text style={{
          fontSize: 11,
          fontWeight: '700',
          color: '#ffffff',
          maxWidth: 160,
          overflow: 'hidden',
        }} numberOfLines={1}>{message}</Text>
      </View>
    );
  }

  return (
    <View style={{
      width: '100%',
      padding: '12px 16px',
      borderRadius: '12px',
      background: type === 'gain'
        ? 'linear-gradient(135deg, #fbbf24, #f97316)'
        : 'linear-gradient(135deg, #60a5fa, #a78bfa)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <Text style={{ fontSize: '18px', marginRight: '8px' }}>{icon}</Text>
      <Text style={{ fontSize: '15px', fontWeight: '700', color: '#ffffff', textAlign: 'center' }}>{message}</Text>
    </View>
  );
}
