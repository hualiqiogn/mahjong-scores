import { useMemo } from 'react'
import { View, Text } from '@tarojs/components'
import { useGameStore } from '@/store/gameStore'
import PlayfulBadge from './PlayfulBadge'

const PLAYER_COLORS = [
  { accent: '#007AFF', bg: '#EBF5FF', ring: 'rgba(0,122,255,0.2)' },
  { accent: '#34C759', bg: '#ECFDF5', ring: 'rgba(52,199,89,0.2)' },
  { accent: '#FF9500', bg: '#FFF8EB', ring: 'rgba(255,149,0,0.2)' },
  { accent: '#AF52DE', bg: '#F5F0FF', ring: 'rgba(175,82,222,0.2)' },
]

const MEDAL_CONFIGS = [
  {
    ribbon: 'linear-gradient(180deg, #EF4444, #B91C1C)',
    body: 'linear-gradient(135deg, #FDE68A, #F59E0B, #92400E)',
    border: 'rgba(253,230,138,0.6)',
    star: '#FDE68A',
    shadow: '0 4px 12px rgba(245,158,11,0.5)',
  },
  {
    ribbon: 'linear-gradient(180deg, #3B82F6, #1D4ED8)',
    body: 'linear-gradient(135deg, #E5E7EB, #9CA3AF, #374151)',
    border: 'rgba(229,231,235,0.6)',
    star: '#D1D5DB',
    shadow: '0 4px 12px rgba(156,163,175,0.4)',
  },
  {
    ribbon: 'linear-gradient(180deg, #F97316, #C2410C)',
    body: 'linear-gradient(135deg, #FED7AA, #F97316, #7C2D12)',
    border: 'rgba(254,215,170,0.6)',
    star: '#FDBA74',
    shadow: '0 4px 12px rgba(249,115,22,0.4)',
  },
]

function Medal({ rank }: { rank: number }) {
  const config = MEDAL_CONFIGS[rank]
  if (!config) return null

  return (
    <View style={{ position: 'relative', width: 48, height: 56 }}>
      <View style={{ position: 'absolute', top: -4, left: 8, width: 32, height: 16, background: config.ribbon, borderTopLeftRadius: 6, borderTopRightRadius: 6 }} />
      <View style={{ position: 'absolute', top: 0, left: 4, width: 40, height: 12, background: config.ribbon }} />
      <View style={{ position: 'absolute', top: 12, left: 0, width: 48, height: 48, background: config.body, borderRadius: 24, boxShadow: config.shadow }} />
      <View style={{ position: 'absolute', top: 12, left: 0, width: 48, height: 48, background: 'linear-gradient(0deg, rgba(0,0,0,0.15), transparent)', borderRadius: 24 }} />
      <View style={{ position: 'absolute', top: 16, left: 4, width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderStyle: 'solid', borderColor: config.border }} />
      <View style={{ position: 'absolute', top: 20, left: 4, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 20 }}>🏅</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0 }}>
        <Text style={{ fontSize: 8, color: config.star }}>⭐</Text>
      </View>
      <View style={{ position: 'absolute', bottom: 4, left: 0 }}>
        <Text style={{ fontSize: 6, color: config.star }}>⭐</Text>
      </View>
      <View style={{ position: 'absolute', top: 32, right: 0 }}>
        <Text style={{ fontSize: 5, color: config.star }}>⭐</Text>
      </View>
      <View style={{ position: 'absolute', top: 16, left: 8, width: 16, height: 16, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 8 }} />
    </View>
  )
}

export default function PlayerCards() {
  const { players, myPlayerId } = useGameStore()

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => b.score - a.score)
  }, [players])

  return (
    <View style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
      {sortedPlayers.map((player, rank) => {
        const isMe = player.id === myPlayerId
        const colors = PLAYER_COLORS[rank % PLAYER_COLORS.length]
        const isTop3 = rank < 3

        return (
          <View
            key={player.id}
            style={{
              width: '48%',
              marginBottom: 12,
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 16,
              position: 'relative',
              boxShadow: isMe
                ? `0 2px 12px rgba(0,0,0,0.08), 0 0 0 2px ${colors.ring}`
                : '0 2px 12px rgba(0,0,0,0.08)',
            }}
          >
            <View style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
              <View style={{ display: 'flex', alignItems: 'center' }}>
                <View style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: 12 }}>
                  {isTop3 ? (
                    <Medal rank={rank} />
                  ) : (
                    <View style={{ width: 40, height: 40, backgroundColor: colors.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 14, fontWeight: 'bold', color: colors.accent }}>#{rank + 1}</Text>
                    </View>
                  )}
                </View>
                <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151' }}>{player.name}</Text>
              </View>
              {isMe && (
                <View style={{ backgroundColor: '#EBF5FF', borderRadius: 9999, paddingTop: 4, paddingBottom: 4, paddingLeft: 10, paddingRight: 10 }}>
                  <Text style={{ fontSize: 12, color: '#007AFF', fontWeight: '600' }}>我</Text>
                </View>
              )}
            </View>

            <View style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 8, paddingBottom: 8 }}>
              <Text style={{
                fontSize: 36,
                fontWeight: 'bold',
                color: player.score > 0 ? '#22C55E' : player.score < 0 ? '#EF4444' : '#1F2937',
              }}>
                {player.score > 0 ? '+' : ''}{player.score}
              </Text>
            </View>

            <View style={{ marginTop: 8 }}>
              <View style={{ marginBottom: 6 }}>
                <PlayfulBadge type="gain" count={player.consecutiveGains} />
              </View>
              <View>
                <PlayfulBadge type="give" count={player.consecutiveGives} />
              </View>
            </View>

            <View style={{ position: 'absolute', top: 12, right: 12, opacity: 0.1 }}>
              <Text style={{ fontSize: 24 }}>🐟</Text>
            </View>
          </View>
        )
      })}
    </View>
  )
}
