import { useState } from 'react';
import { View, Text, Input } from '@tarojs/components';
import { useGameStore } from '@/store/gameStore';
import type { GameMode } from '@/store/gameStore';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #e0f2fe 0%, #f0f9ff 50%, #ffffff 100%)',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    padding: '40px 24px',
    boxSizing: 'border-box' as const,
  },
  logoCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 8px 24px rgba(59, 130, 246, 0.35)',
    marginBottom: '16px',
  },
  logoEmoji: {
    fontSize: '48px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold' as const,
    color: '#2563EB',
    marginBottom: '8px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#64748b',
    marginBottom: '32px',
  },
  tabContainer: {
    display: 'flex',
    gap: '0',
    marginBottom: '28px',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  },
  tabButton: {
    flex: 1,
    padding: '12px 24px',
    fontSize: '15px',
    fontWeight: 'bold' as const,
    textAlign: 'center' as const,
    backgroundColor: '#ffffff',
    color: '#64748b',
    border: 'none',
  },
  tabButtonActiveCreate: {
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
  },
  tabButtonActiveJoin: {
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#ffffff',
  },
  formContainer: {
    width: '100%',
    maxWidth: '360px',
  },
  inputGroup: {
    marginBottom: '20px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#334155',
    marginBottom: '8px',
    display: 'block',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    border: '2px solid #bfdbfe',
    borderRadius: '20px',
    paddingLeft: '16px',
    paddingRight: '16px',
    height: '48px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  inputIcon: {
    fontSize: '18px',
    marginRight: '10px',
  },
  input: {
    flex: 1,
    height: '44px',
    fontSize: '15px',
    color: '#1e293b',
    border: 'none',
    backgroundColor: 'transparent',
  },
  modeCards: {
    display: 'flex',
    gap: '12px',
    marginBottom: '20px',
  },
  modeCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    border: '2px solid #e2e8f0',
    borderRadius: '16px',
    padding: '16px 12px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '6px',
    position: 'relative' as const,
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  modeCardSelected: {
    borderColor: '#3b82f6',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.2)',
  },
  modeCardEmoji: {
    fontSize: '28px',
    marginBottom: '4px',
  },
  modeCardTitle: {
    fontSize: '14px',
    fontWeight: 'bold' as const,
    color: '#1e293b',
  },
  modeCardDesc: {
    fontSize: '11px',
    color: '#94a3b8',
  },
  pulseDot: {
    position: 'absolute' as const,
    top: '8px',
    right: '8px',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
  },
  baseScoreContainer: {
    marginBottom: '20px',
  },
  baseScoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  baseScoreBtn: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#eff6ff',
    border: '2px solid #bfdbfe',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    color: '#3b82f6',
    fontWeight: 'bold' as const,
  },
  baseScoreInput: {
    width: '80px',
    height: '40px',
    borderRadius: '12px',
    border: '2px solid #bfdbfe',
    textAlign: 'center' as const,
    fontSize: '18px',
    fontWeight: 'bold' as const,
    color: '#1e293b',
    backgroundColor: '#ffffff',
  },
  createButton: {
    width: '100%',
    height: '52px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(59, 130, 246, 0.35)',
    border: 'none',
    marginTop: '8px',
  },
  joinButton: {
    width: '100%',
    height: '52px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
    color: '#ffffff',
    fontSize: '17px',
    fontWeight: 'bold' as const,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(245, 158, 11, 0.35)',
    border: 'none',
    marginTop: '8px',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: '13px',
    textAlign: 'center' as const,
    marginTop: '12px',
  },
  bottomDecor: {
    marginTop: '40px',
    display: 'flex',
    gap: '16px',
    fontSize: '20px',
    opacity: 0.5,
  },
  roomIdInput: {
    letterSpacing: '4px',
  },
};

export default function GameSetup() {
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [gameMode, setGameMode] = useState<GameMode>('cumulative');
  const [baseScore, setBaseScore] = useState(10);
  const [roomId, setRoomId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { createRoom, joinRoom } = useGameStore();

  const handleCreate = async () => {
    if (!playerName.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      await createRoom(playerName.trim(), gameMode, baseScore);
    } catch {
      setError('创建房间失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    if (!playerName.trim() || !roomId.trim() || loading) return;
    setLoading(true);
    setError('');
    try {
      const success = await joinRoom(roomId.trim(), playerName.trim());
      if (!success) {
        setError('房间不存在或已满');
      }
    } catch (e) {
      setError('加入房间失败，请检查网络后重试');
    } finally {
      setLoading(false);
    }
  };

  const adjustBaseScore = (delta: number) => {
    setBaseScore(prev => Math.max(1, prev + delta));
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoCircle}>
        <Text style={styles.logoEmoji}>🐟</Text>
      </View>
      <Text style={styles.title}>鱼乐无穷</Text>
      <Text style={styles.subtitle}>多人协作 · 欢乐计分</Text>

      <View style={styles.tabContainer}>
        <View
          style={{
            ...styles.tabButton,
            ...(mode === 'create' ? styles.tabButtonActiveCreate : {}),
          }}
          onClick={() => { setMode('create'); setError(''); }}
        >
          <Text style={{ color: mode === 'create' ? '#ffffff' : '#64748b', fontWeight: 'bold' }}>
            ✦ 创建房间
          </Text>
        </View>
        <View
          style={{
            ...styles.tabButton,
            ...(mode === 'join' ? styles.tabButtonActiveJoin : {}),
          }}
          onClick={() => { setMode('join'); setError(''); }}
        >
          <Text style={{ color: mode === 'join' ? '#ffffff' : '#64748b', fontWeight: 'bold' }}>
            ✦ 加入房间
          </Text>
        </View>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>👤 昵称</Text>
          <View style={styles.inputWrapper}>
            <Input
              style={styles.input}
              placeholder='输入你的昵称'
              placeholderStyle='color: #94a3b8'
              value={playerName}
              onInput={(e) => setPlayerName(e.detail.value)}
              maxlength={12}
            />
          </View>
        </View>

        {mode === 'create' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🎮 计分模式</Text>
              <View style={styles.modeCards}>
                <View
                  style={{
                    ...styles.modeCard,
                    ...(gameMode === 'cumulative' ? styles.modeCardSelected : {}),
                  }}
                  onClick={() => setGameMode('cumulative')}
                >
                  {gameMode === 'cumulative' && <View style={styles.pulseDot} />}
                  <Text style={styles.modeCardEmoji}>📊</Text>
                  <Text style={styles.modeCardTitle}>累计总分制</Text>
                  <Text style={styles.modeCardDesc}>分数只增不减</Text>
                </View>
                <View
                  style={{
                    ...styles.modeCard,
                    ...(gameMode === 'multiplier' ? styles.modeCardSelected : {}),
                  }}
                  onClick={() => setGameMode('multiplier')}
                >
                  {gameMode === 'multiplier' && <View style={styles.pulseDot} />}
                  <Text style={styles.modeCardEmoji}>🎲</Text>
                  <Text style={styles.modeCardTitle}>番数倍率制</Text>
                  <Text style={styles.modeCardDesc}>有赢有输刺激</Text>
                </View>
              </View>
            </View>

            {gameMode === 'multiplier' && (
              <View style={styles.baseScoreContainer}>
                <Text style={styles.label}>💰 底分</Text>
                <View style={styles.baseScoreRow}>
                  <View style={styles.baseScoreBtn} onClick={() => adjustBaseScore(-1)}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>-</Text>
                  </View>
                  <Input
                    style={styles.baseScoreInput}
                    type='number'
                    value={String(baseScore)}
                    onInput={(e) => {
                      const val = parseInt(e.detail.value, 10);
                      if (!isNaN(val) && val > 0) setBaseScore(val);
                    }}
                  />
                  <View style={styles.baseScoreBtn} onClick={() => adjustBaseScore(1)}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold' }}>+</Text>
                  </View>
                </View>
              </View>
            )}

            <View
              style={{
                ...styles.createButton,
                ...(loading || !playerName.trim() ? styles.buttonDisabled : {}),
              }}
              onClick={handleCreate}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '17px' }}>
                {loading ? '⏳ 创建中...' : '🚀 创建房间'}
              </Text>
            </View>
          </>
        )}

        {mode === 'join' && (
          <>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>🏠 房间号</Text>
              <View style={styles.inputWrapper}>
                <Input
                  style={{ ...styles.input, ...styles.roomIdInput }}
                  placeholder='输入6位房间号'
                  placeholderStyle='color: #94a3b8'
                  type='number'
                  value={roomId}
                  onInput={(e) => setRoomId(e.detail.value)}
                  maxlength={6}
                />
              </View>
            </View>

            <View
              style={{
                ...styles.joinButton,
                ...(loading || !playerName.trim() || !roomId.trim() ? styles.buttonDisabled : {}),
              }}
              onClick={handleJoin}
            >
              <Text style={{ color: '#ffffff', fontWeight: 'bold', fontSize: '17px' }}>
                {loading ? '⏳ 加入中...' : '🎯 加入房间'}
              </Text>
            </View>
          </>
        )}

        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>

      <View style={styles.bottomDecor}>
        <Text>🌊</Text>
        <Text>🐟</Text>
        <Text>⚓</Text>
        <Text>🎏</Text>
        <Text>🐚</Text>
      </View>
    </View>
  );
}
