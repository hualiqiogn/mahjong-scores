import { useMemo, useState, useEffect, useRef } from 'react'
import { View, Text } from '@tarojs/components'
import { useGameStore } from '@/store/gameStore'
import PlayfulBadge from './PlayfulBadge'

const PLAYER_COLORS = [
  { accent: '#007AFF', bg: '#EBF5FF', ring: 'rgba(0,122,255,0.2)' },
  { accent: '#34C759', bg: '#ECFDF5', ring: 'rgba(52,199,89,0.2)' },
  { accent: '#FF9500', bg: '#FFF8EB', ring: 'rgba(255,149,0,0.2)' },
  { accent: '#AF52DE', bg: '#F5F0FF', ring: 'rgba(175,82,222,0.2)' },
]

const RANK_STYLES = [
  { emoji: '🥇', bg: 'linear-gradient(135deg, #FEF3C7, #FDE68A)', border: 'rgba(245,158,11,0.4)' },
  { emoji: '🥈', bg: 'linear-gradient(135deg, #F1F5F9, #E2E8F0)', border: 'rgba(148,163,184,0.4)' },
  { emoji: '🥉', bg: 'linear-gradient(135deg, #FFF7ED, #FED7AA)', border: 'rgba(249,115,22,0.4)' },
]

export default function PlayerCards() {
  const players = useGameStore(s => s.players)
  const myPlayerId = useGameStore(s => s.myPlayerId)

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score)
  }, [players])

  // === 动态得分动画追踪 ===
  const [animDeltas, setAnimDeltas] = useState<Record<string, number>>({})
  const prevScoresRef = useRef<Record<string, number>>({})
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const mountedRef = useRef(true)

  // 用 scoreKey 作为 effect 依赖，仅在分数变化时触发
  const scoreKey = players.map(p => `${p.id}:${p.score}`).join('|')

  useEffect(() => {
    players.forEach(player => {
      const prev = prevScoresRef.current[player.id]
      if (prev !== undefined && prev !== player.score) {
        const delta = player.score - prev
        if (delta !== 0) {
          // 清除该玩家之前的定时器
          if (timersRef.current[player.id]) {
            clearTimeout(timersRef.current[player.id])
          }

          // 立即更新动画状态
          setAnimDeltas(prev => ({ ...prev, [player.id]: delta }))

          // 3秒后自动消失
          timersRef.current[player.id] = setTimeout(() => {
            if (mountedRef.current) {
              setAnimDeltas(prev => {
                const next = { ...prev }
                delete next[player.id]
                return next
              })
            }
          }, 3000)
        }
      }
      prevScoresRef.current[player.id] = player.score
    })
  }, [scoreKey])

  // 组件卸载时清理
  useEffect(() => {
    mountedRef.current = true
    return () => {
      mountedRef.current = false
      Object.values(timersRef.current).forEach(clearTimeout)
    }
  }, [])

  return (
    <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      {sortedPlayers.map((player, rank) => {
        const isMe = player.id === myPlayerId
        const colors = PLAYER_COLORS[rank % PLAYER_COLORS.length]
        const isTop3 = rank < 3
        const animDelta = animDeltas[player.id]
        const showAnim = animDelta !== undefined && animDelta !== 0

        return (
          <View
            key={player.id}
            style={{
              flex: 1,
              width: '100%',
              boxSizing: 'border-box',
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
              boxShadow: isMe
                ? `0 2px 12px rgba(0,0,0,0.08), 0 0 0 2px ${colors.ring}`
                : '0 2px 12px rgba(0,0,0,0.08)',
              marginTop: rank > 0 ? 8 : 0,
              minHeight: 0,
              overflow: 'hidden',
            }}
          >
            {/* 左侧：排名标识 */}
            <View style={{ flexShrink: 0, marginRight: 10 }}>
              {isTop3 ? (
                <View style={{
                  width: 36,
                  height: 36,
                  background: RANK_STYLES[rank].bg,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `1px solid ${RANK_STYLES[rank].border}`,
                }}>
                  <Text style={{ fontSize: 18 }}>{RANK_STYLES[rank].emoji}</Text>
                </View>
              ) : (
                <View style={{
                  width: 36,
                  height: 36,
                  backgroundColor: colors.bg,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Text style={{ fontSize: 13, fontWeight: 'bold', color: colors.accent }}>#{rank + 1}</Text>
                </View>
              )}
            </View>

            {/* 中间：名字 + 固定分值 + 徽章 */}
            <View style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', overflow: 'hidden' }}>
              <View style={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                <Text style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#374151',
                  overflow: 'hidden',
                  maxWidth: 100,
                  flexShrink: 1,
                }} numberOfLines={1}>{player.name}</Text>
                {isMe && (
                  <View style={{
                    backgroundColor: '#EBF5FF',
                    borderRadius: 9999,
                    paddingTop: 1,
                    paddingBottom: 1,
                    paddingLeft: 6,
                    paddingRight: 6,
                    marginLeft: 4,
                    flexShrink: 0,
                  }}>
                    <Text style={{ fontSize: 10, color: '#007AFF', fontWeight: '600' }}>我</Text>
                  </View>
                )}
              </View>

              {/* 固定分值区域 - 正数不加+号，负数显示-，正数绿色，负数红色 */}
              <Text style={{
                fontSize: 20,
                fontWeight: 'bold',
                color: player.score > 0 ? '#22C55E' : player.score < 0 ? '#EF4444' : '#1F2937',
                marginTop: 2,
              }}>
                {player.score}
              </Text>

              {/* 连胜/连给徽章 - 完整显示文案 */}
              <View style={{ display: 'flex', flexDirection: 'row', marginTop: 3 }}>
                <View style={{ marginRight: 4 }}>
                  <PlayfulBadge type="gain" count={player.consecutiveGains} compact />
                </View>
                <View>
                  <PlayfulBadge type="give" count={player.consecutiveGives} compact />
                </View>
              </View>
            </View>

            {/* 右侧：动态得分动画 - 仅显示3秒 */}
            {showAnim && (
              <View style={{
                flexShrink: 0,
                marginLeft: 8,
                paddingLeft: 8,
                paddingRight: 8,
                paddingTop: 4,
                paddingBottom: 4,
                borderRadius: 8,
                backgroundColor: animDelta > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Text style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: animDelta > 0 ? '#22C55E' : '#EF4444',
                }}>
                  {animDelta > 0 ? `+${animDelta}` : `${animDelta}`}
                </Text>
              </View>
            )}

            {/* 水印装饰 */}
            <View style={{ position: 'absolute', top: 4, right: 6, opacity: 0.05 }}>
              <Text style={{ fontSize: 14 }}>🐟</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
