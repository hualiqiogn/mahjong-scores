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
    <View style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #FAFBFC 0%, #F0F4F8 50%, #FFFFFF 100%)' }}>
      <View style={{
        position: 'relative',
        zIndex: 30,
        background: 'rgba(255,255,255,0.8)',
        borderBottom: '1px solid #f1f5f9',
      }}>
        <View style={{
          maxWidth: 420,
          margin: '0 auto',
          padding: '16px',
        }}>
          <View style={{
            background: 'rgba(255,255,255,0.95)',
            border: '1px solid rgba(0,122,255,0.08)',
            boxShadow: '0 2px 12px rgba(0,122,255,0.04)',
            borderRadius: 16,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <View style={{
                width: 44,
                height: 44,
                background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                borderRadius: 12,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
                marginRight: 12,
              }}>
                <Text style={{ fontSize: 22 }}>🐟</Text>
              </View>
              <View>
                <View style={{ display: 'flex', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 600, color: '#1f2937', fontSize: 16 }}>麻将计分</Text>
                  {syncing && (
                    <Text style={{ fontSize: 12, color: '#9ca3af', marginLeft: 8 }}>同步中...</Text>
                  )}
                </View>
                <View style={{ display: 'flex', alignItems: 'center', marginTop: 4 }}>
                  <View style={{
                    background: '#eff6ff',
                    borderRadius: 8,
                    paddingLeft: 10,
                    paddingRight: 10,
                    paddingTop: 4,
                    paddingBottom: 4,
                  }}>
                    <Text style={{ fontSize: 12, fontFamily: 'monospace', color: '#2563eb', fontWeight: 500 }}>
                      {roomId}
                    </Text>
                  </View>
                  <View
                    onClick={handleCopyRoomId}
                    style={{ padding: 6, marginLeft: 8 }}
                  >
                    <Text style={{ fontSize: 14, color: '#9ca3af' }}>📋</Text>
                  </View>
                  {copied && (
                    <Text style={{ fontSize: 12, color: '#22c55e', fontWeight: 500, marginLeft: 4 }}>已复制</Text>
                  )}
                </View>
              </View>
            </View>
            <View style={{ display: 'flex', alignItems: 'center' }}>
              <View
                onClick={handleManualRefresh}
                style={{
                  padding: 8,
                  marginRight: 4,
                  borderRadius: 8,
                }}
              >
                <Text style={{ fontSize: 18, color: syncing ? '#93c5fd' : '#3b82f6' }}>🔄</Text>
              </View>
              <View
                onClick={() => setShowLeaveConfirm(true)}
                style={{ padding: 10 }}
              >
                <Text style={{ fontSize: 20, color: '#9ca3af' }}>🚪</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <View style={{ maxWidth: 420, margin: '0 auto', padding: '16px', paddingBottom: 120 }}>
        <View style={{ marginBottom: 24 }}>
          <PlayerCards />
        </View>
        <View
          onClick={() => setShowRoundHistory(true)}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px',
            borderRadius: '16px',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
          }}
        >
          <Text style={{ fontSize: '16px', marginRight: '8px' }}>📋</Text>
          <Text style={{ fontSize: '15px', color: '#475569', fontWeight: '600' }}>对局记录</Text>
          {useGameStore.getState().rounds.length > 0 && (
            <View style={{ backgroundColor: '#EFF6FF', borderRadius: '10px', paddingLeft: '8px', paddingRight: '8px', paddingTop: '2px', paddingBottom: '2px', marginLeft: '8px' }}>
              <Text style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>{useGameStore.getState().rounds.length}局</Text>
            </View>
          )}
        </View>
      </View>

      <View style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'rgba(255,255,255,0.9)',
        borderTop: '1px solid #f1f5f9',
        zIndex: 20,
      }}>
        <View style={{
          maxWidth: 420,
          margin: '0 auto',
          padding: 16,
          display: 'flex',
          gap: 12,
        }}>
          <View
            onClick={() => setShowEndConfirm(true)}
            style={{
              padding: '14px 20px',
              borderRadius: 16,
              border: '1px solid #e5e7eb',
              color: '#4b5563',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 16, marginRight: 6 }}>✕</Text>
            <Text style={{ color: '#4b5563', fontWeight: 600, fontSize: 14 }}>结束游戏</Text>
          </View>
          <View
            onClick={() => setShowScoreModal(true)}
            style={{
              flex: 1,
              padding: '14px 24px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 16,
              boxShadow: '0 4px 12px rgba(59,130,246,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, marginRight: 6, color: '#fff' }}>＋</Text>
            <Text style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>记录本局</Text>
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
