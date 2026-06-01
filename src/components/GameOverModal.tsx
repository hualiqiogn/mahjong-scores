import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { useGameStore } from '@/store/gameStore'

const LARGE_MEDAL_CONFIGS: Record<number, {
  ribbon: string
  body: string
  border: string
  star: string
  glow: string
}> = {
  1: {
    ribbon: 'linear-gradient(180deg, #EF4444, #B91C1C)',
    body: 'linear-gradient(135deg, #FDE68A, #F59E0B, #92400E)',
    border: 'rgba(253,230,138,0.6)',
    star: '#FDE68A',
    glow: '0 4px 20px rgba(245,158,11,0.5)',
  },
  2: {
    ribbon: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
    body: 'linear-gradient(135deg, #E5E7EB, #9CA3AF, #374151)',
    border: 'rgba(229,231,235,0.6)',
    star: '#D1D5DB',
    glow: '0 4px 20px rgba(156,163,175,0.4)',
  },
  3: {
    ribbon: 'linear-gradient(180deg, #F97316, #C2410C)',
    body: 'linear-gradient(135deg, #FED7AA, #F97316, #7C2D12)',
    border: 'rgba(254,215,170,0.6)',
    star: '#FDBA74',
    glow: '0 4px 20px rgba(249,115,22,0.4)',
  },
  4: {
    ribbon: 'linear-gradient(180deg, #10B981, #047857)',
    body: 'linear-gradient(135deg, #A7F3D0, #34D399, #065F46)',
    border: 'rgba(167,243,208,0.6)',
    star: '#A7F3D0',
    glow: '0 4px 20px rgba(52,211,153,0.4)',
  },
}

const SMALL_MEDAL_CONFIGS: Record<number, {
  ribbon: string
  body: string
  border: string
  star: string
}> = {
  0: {
    ribbon: 'linear-gradient(180deg, #EF4444, #B91C1C)',
    body: 'linear-gradient(135deg, #FDE68A, #F59E0B, #92400E)',
    border: 'rgba(253,230,138,0.6)',
    star: '#FDE68A',
  },
  1: {
    ribbon: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
    body: 'linear-gradient(135deg, #E5E7EB, #9CA3AF, #374151)',
    border: 'rgba(229,231,235,0.6)',
    star: '#D1D5DB',
  },
  2: {
    ribbon: 'linear-gradient(180deg, #F97316, #C2410C)',
    body: 'linear-gradient(135deg, #FED7AA, #F97316, #7C2D12)',
    border: 'rgba(254,215,170,0.6)',
    star: '#FDBA74',
  },
  3: {
    ribbon: 'linear-gradient(180deg, #10B981, #047857)',
    body: 'linear-gradient(135deg, #A7F3D0, #34D399, #065F46)',
    border: 'rgba(167,243,208,0.6)',
    star: '#A7F3D0',
  },
}

const RANK_MESSAGES: Record<number, {
  title: string
  subtitle: string
  gradient: string
}> = {
  1: {
    title: '恭喜你获得冠军！',
    subtitle: '实至名归的麻将大师，今晚的MVP！',
    gradient: 'linear-gradient(135deg, #FEF3C7, #FFEDD5)',
  },
  2: {
    title: '亚军，也很厉害！',
    subtitle: '离冠军只差一步，下次一定行！',
    gradient: 'linear-gradient(135deg, #F9FAFB, #F3F4F6)',
  },
  3: {
    title: '季军，不错哦！',
    subtitle: '稳扎稳打，下次冲击冠军！',
    gradient: 'linear-gradient(135deg, #FFF7ED, #FEF2F2)',
  },
  4: {
    title: '🎖️ 参与奖，下次翻盘！',
    subtitle: '重在参与，麻将有输有赢，下次一定能赢回来！',
    gradient: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
  },
}

function LargeMedal({ rank }: { rank: number }) {
  const config = LARGE_MEDAL_CONFIGS[rank]

  if (!config) {
    return (
      <View style={{ width: 80, height: 96, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: '#F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        }}>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#6B7280' }}>#{rank}</Text>
        </View>
      </View>
    )
  }

  return (
    <View style={{ position: 'relative', width: 80, height: 96 }}>
      <View style={{ position: 'absolute', top: -4, left: 24, width: 32, height: 16, background: config.ribbon, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
      <View style={{ position: 'absolute', top: 0, left: 20, width: 40, height: 12, background: config.ribbon }} />
      <View style={{ position: 'absolute', top: 12, left: 0, width: 80, height: 80, background: config.body, borderRadius: 40, boxShadow: config.glow }} />
      <View style={{ position: 'absolute', top: 12, left: 0, width: 80, height: 80, background: 'linear-gradient(0deg, rgba(0,0,0,0.15), transparent)', borderRadius: 40 }} />
      <View style={{ position: 'absolute', top: 16, left: 4, width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderStyle: 'solid', borderColor: config.border }} />
      <View style={{ position: 'absolute', top: 20, left: 8, width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 32 }}>{rank === 4 ? '🎖️' : '🏅'}</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0 }}>
        <Text style={{ fontSize: 10, color: config.star }}>⭐</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 4, left: 0 }}>
        <Text style={{ fontSize: 8, color: config.star }}>⭐</Text>
      </View>
      <View style={{ position: 'absolute', top: 20, left: 8, width: 16, height: 16, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 8 }} />
    </View>
  )
}

function SmallMedal({ rank }: { rank: number }) {
  const config = SMALL_MEDAL_CONFIGS[rank]

  if (!config) {
    return (
      <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#6B7280' }}>{rank + 1}</Text>
      </View>
    )
  }

  return (
    <View style={{ position: 'relative', width: 36, height: 44 }}>
      <View style={{ position: 'absolute', top: -2, left: 8, width: 20, height: 8, background: config.ribbon, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
      <View style={{ position: 'absolute', top: 4, left: 0, width: 36, height: 36, background: config.body, borderRadius: 18, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }} />
      <View style={{ position: 'absolute', top: 4, left: 0, width: 36, height: 36, background: 'linear-gradient(0deg, rgba(0,0,0,0.1), transparent)', borderRadius: 18 }} />
      <View style={{ position: 'absolute', top: 6, left: 2, width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderStyle: 'solid', borderColor: config.border }} />
      <View style={{ position: 'absolute', top: 8, left: 2, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 14 }}>{rank === 3 ? '🎖️' : '🏅'}</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0 }}>
        <Text style={{ fontSize: 6, color: config.star }}>⭐</Text>
      </View>
    </View>
  )
}

export default function GameOverModal() {
  const { players, isGameOver, resetGame, leaveGame, myPlayerId } = useGameStore()

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score)
  }, [players])

  const myRank = useMemo(() => {
    return sortedPlayers.findIndex(p => p.id === myPlayerId) + 1
  }, [sortedPlayers, myPlayerId])

  if (!isGameOver) return null

  const rankInfo = RANK_MESSAGES[myRank] || RANK_MESSAGES[4]

  return (
    <View style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 50,
      overflow: 'hidden',
      paddingLeft: 16,
      paddingRight: 16,
      paddingTop: 16,
      paddingBottom: 16,
    }}>
      <View style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
        maxWidth: 380,
        width: '100%',
        padding: 20,
      }}>
        <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <LargeMedal rank={myRank} />
        </View>

        <View style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 20,
          padding: 16,
          background: rankInfo.gradient,
          borderRadius: 12,
        }}>
          <View style={{ marginBottom: 6 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#111827' }}>{rankInfo.title}</Text>
          </View>
          <View>
            <Text style={{ fontSize: 14, color: '#4B5563' }}>{rankInfo.subtitle}</Text>
          </View>
        </View>

        <View style={{ marginBottom: 20 }}>
          {sortedPlayers.map((player, index) => {
            const isMe = player.id === myPlayerId
            const isChampion = index === 0

            let itemBackground = '#F9FAFB'
            let itemBoxShadow = 'none'
            if (isMe) {
              itemBackground = 'linear-gradient(135deg, #EFF6FF, #FAF5FF)'
              itemBoxShadow = '0 0 0 1.5px #93C5FD'
            } else if (isChampion) {
              itemBackground = 'linear-gradient(135deg, #FEF3C7, #FFEDD5)'
              itemBoxShadow = '0 0 0 1.5px #FDE68A'
            }

            return (
              <View
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 12,
                  marginBottom: index < sortedPlayers.length - 1 ? 10 : 0,
                  background: itemBackground,
                  boxShadow: itemBoxShadow,
                }}
              >
                <View style={{ marginRight: 12, flexShrink: 0 }}>
                  <SmallMedal rank={index} />
                </View>

                <View style={{ flex: 1, minWidth: 0 }}>
                  <View style={{ display: 'flex', alignItems: 'center' }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: '#111827' }}>{player.name}</Text>
                    {isMe && (
                      <View style={{ marginLeft: 6, backgroundColor: '#DBEAFE', borderRadius: 9999, paddingTop: 2, paddingBottom: 2, paddingLeft: 6, paddingRight: 6 }}>
                        <Text style={{ fontSize: 10, color: '#2563EB', fontWeight: '500' }}>我</Text>
                      </View>
                    )}
                  </View>
                  <View style={{ marginTop: 2 }}>
                    <Text style={{ fontSize: 12, color: '#9CA3AF' }}>
                      {index === 0 ? '冠军' : index === 1 ? '亚军' : index === 2 ? '季军' : `第${index + 1}名`}
                    </Text>
                  </View>
                </View>

                <View style={{ marginLeft: 12, flexShrink: 0 }}>
                  <Text style={{
                    fontSize: 18,
                    fontWeight: 'bold',
                    color: player.score > 0 ? '#22C55E' : player.score < 0 ? '#EF4444' : '#1F2937',
                  }}>
                    {player.score > 0 ? '+' : ''}{player.score}
                  </Text>
                </View>
              </View>
            )
          })}
        </View>

        <View style={{ display: 'flex' }}>
          <View
            onClick={leaveGame}
            style={{
              flex: 1,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 12,
              backgroundColor: '#F3F4F6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginRight: 12,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>🏠 返回首页</Text>
          </View>
          <View
            onClick={resetGame}
            style={{
              flex: 1,
              paddingTop: 12,
              paddingBottom: 12,
              paddingLeft: 16,
              paddingRight: 16,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #007AFF, #5856D6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,122,255,0.4)',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#FFFFFF' }}>🔄 再来一局</Text>
          </View>
        </View>
      </View>
    </View>
  )
}
