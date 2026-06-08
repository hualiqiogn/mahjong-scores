import { useState, useEffect, useRef } from 'react';
import { View, Text } from '@tarojs/components';
import Taro, { useDidShow, useDidHide } from '@tarojs/taro';
import { useGameStore } from '@/store/gameStore';
import GameSetup from '@/components/GameSetup';
import PlayerCards from '@/components/PlayerCards';
import RoundHistory from '@/components/RoundHistory';
import GameOverModal from '@/components/GameOverModal';
import ConfirmModal from '@/components/ConfirmModal';
import ScoreModal from '@/components/ScoreModal';

const POLL_INTERVAL = 2000;

export default function Index() {
  const roomId = useGameStore(s => s.roomId);
  const inRoom = useGameStore(s => s.inRoom);
  const endGame = useGameStore(s => s.endGame);
  const leaveGame = useGameStore(s => s.leaveGame);
  const pollRoomData = useGameStore(s => s.pollRoomData);

  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [showRoundHistory, setShowRoundHistory] = useState(false);
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPolling = useRef(false);

  const doPoll = async (showIndicator = false) => {
    if (isPolling.current) return;
    isPolling.current = true;
    if (showIndicator) setSyncing(true);
    try {
      await pollRoomData();
    } catch {}
    isPolling.current = false;
    if (showIndicator) setSyncing(false);
  };

  const startPolling = () => {
    stopPolling();
    doPoll(true);
    const loop = () => {
      pollTimer.current = setTimeout(async () => {
        await doPoll(false);
        if (pollTimer.current !== null) {
          loop();
        }
      }, POLL_INTERVAL);
    };
    loop();
  };

  const stopPolling = () => {
    if (pollTimer.current) {
      clearTimeout(pollTimer.current);
      pollTimer.current = null;
    }
    isPolling.current = false;
  };

  useDidShow(() => {
    if (inRoom && roomId) {
      startPolling();
    }
  });

  useDidHide(() => {
    stopPolling();
  });

  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, []);

  useEffect(() => {
    if (inRoom && roomId) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [inRoom, roomId]);

  const handleCopyRoomId = () => {
    Taro.setClipboardData({
      data: roomId,
      success: () => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      },
    });
  };

  const handleManualRefresh = () => {
    doPoll(true);
  };

  if (!inRoom) {
    return <GameSetup />;
  }

  return (
    <View style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 50%, #FFFFFF 100%)' }}>
      {/* 房间卡片 - 固定高度，全宽背景 */}
      <View style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <View style={{
          maxWidth: 420,
          margin: '0 auto',
          padding: '10px 16px',
          boxSizing: 'border-box',
          width: '100%',
        }}>
          <View style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,122,255,0.08)',
            boxShadow: '0 2px 12px rgba(0,122,255,0.04)',
            borderRadius: 16,
            padding: 14,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <View style={{
                width: 40,
                height: 40,
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                marginRight: 10,
              }}>
                <Text style={{ fontSize: 20 }}>🐟</Text>
              </View>
              <View>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 600, color: '#1f2937', fontSize: 15 }}>麻将计分</Text>
                  {syncing && (
                    <Text style={{ fontSize: 11, color: '#9ca3af', marginLeft: 6 }}>同步中...</Text>
                  )}
                </View>
                <View style={{ display: 'flex', alignItems: 'center', marginTop: 3 }}>
                  <View style={{
                    background: '#eff6ff',
                    borderRadius: 6,
                    paddingLeft: 8,
                    paddingRight: 8,
                    paddingTop: 2,
                    paddingBottom: 2,
                  }}>
                    <Text style={{ fontSize: 11, fontFamily: 'monospace', color: '#2563eb', fontWeight: 500 }}>
                      {roomId}
                    </Text>
                  </View>
                  <View
                    onClick={handleCopyRoomId}
                    style={{ padding: 4, marginLeft: 6 }}
                  >
                    <Text style={{ fontSize: 12, color: '#9ca3af' }}>📋</Text>
                  </View>
                  {copied && (
                    <Text style={{ fontSize: 11, color: '#22c55e', fontWeight: 500, marginLeft: 3 }}>已复制</Text>
                  )}
                </View>
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <View
                onClick={handleManualRefresh}
                style={{ padding: 6, marginRight: 2, borderRadius: 8 }}
              >
                <Text style={{ fontSize: 16, color: syncing ? '#93c5fd' : '#3b82f6' }}>🔄</Text>
              </View>
              <View
                onClick={() => setShowLeaveConfirm(true)}
                style={{ padding: 6 }}
              >
                <Text style={{ fontSize: 18, color: '#9ca3af' }}>🚪</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 中间内容区 - flex:1 自适应，与房间卡片同宽 */}
      <View style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 420,
        margin: '0 auto',
        padding: '8px 16px',
        width: '100%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}>
        {/* 玩家列表 - flex:1 填充剩余空间 */}
        <View style={{ flex: 1 }}>
          <PlayerCards />
        </View>

        {/* 对局记录按钮 - 固定高度 */}
        <View
          onClick={() => setShowRoundHistory(true)}
          style={{
            flexShrink: 0,
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            borderRadius: '14px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            marginTop: 8,
          }}
        >
          <Text style={{ fontSize: '15px', marginRight: '6px' }}>📋</Text>
          <Text style={{ fontSize: '14px', color: '#475569', fontWeight: '600' }}>对局记录</Text>
          {useGameStore.getState().rounds.length > 0 && (
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: '8px', paddingLeft: '6px', paddingRight: '6px', paddingTop: '2px', paddingBottom: '2px', marginLeft: '6px' }}>
              <Text style={{ fontSize: '11px', color: '#2563EB', fontWeight: '600' }}>{useGameStore.getState().rounds.length}局</Text>
            </View>
          )}
        </View>
      </View>

      {/* 底部按钮 - 固定高度，全宽背景 */}
      <View style={{
        flexShrink: 0,
        background: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid #f1f5f9',
      }}>
        <View style={{
          maxWidth: 420,
          margin: '0 auto',
          padding: '10px 16px',
          boxSizing: 'border-box',
          width: '100%',
          display: 'flex',
          gap: 10,
        }}>
          <View
            onClick={() => setShowEndConfirm(true)}
            style={{
              padding: '12px 18px',
              borderRadius: 14,
              border: '1px solid #e5e7eb',
              color: '#4b5563',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 14, marginRight: 4 }}>✕</Text>
            <Text style={{ color: '#4b5563', fontWeight: 600, fontSize: 13 }}>结束游戏</Text>
          </View>
          <View
            onClick={() => setShowScoreModal(true)}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: 14,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 18, marginRight: 4, color: '#fff' }}>＋</Text>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>记录本局</Text>
          </View>
        </View>
      </View>

      <ConfirmModal
        isOpen={showLeaveConfirm}
        title='退出房间'
        description='确定要离开当前房间吗？其他人不会受到影响。'
        confirmText='确认退出'
        onConfirm={() => {
          stopPolling();
          setShowLeaveConfirm(false);
          leaveGame();
        }}
        onCancel={() => setShowLeaveConfirm(false)}
        type='warning'
      />

      <ConfirmModal
        isOpen={showEndConfirm}
        title='结束游戏'
        description='确定要结束当前游戏并查看最终结果吗？所有玩家将看到结算页面。'
        confirmText='结束游戏'
        onConfirm={() => {
          setShowEndConfirm(false);
          endGame();
        }}
        onCancel={() => setShowEndConfirm(false)}
        type='danger'
      />

      <ScoreModal
        isOpen={showScoreModal}
        onClose={() => setShowScoreModal(false)}
      />

      <GameOverModal />

      <RoundHistory
        isOpen={showRoundHistory}
        onClose={() => setShowRoundHistory(false)}
      />
    </View>
  );
}
